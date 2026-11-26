using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.DTOs;
using Vitalia.Api.Models;
using Vitalia.Api.Services;

namespace Vitalia.Api.Controllers;

[ApiController]
[Authorize(Roles = "Paciente")]
[Route("api/citas")]
public sealed class CitasController(VitaliaDbContext db) : ControllerBase
{
    private string? PacienteId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("mis-citas")]
    public async Task<IActionResult> MisCitas()
    {
        var pacienteId = PacienteId;
        if (string.IsNullOrWhiteSpace(pacienteId)) return Unauthorized();
        var lista = await db.Citas.AsNoTracking().Where(c => c.PacienteId == pacienteId)
            .OrderByDescending(c => c.Fecha).ThenByDescending(c => c.Hora)
            .Select(c => new CitaRespuestaDto
            {
                Id = c.Id, MedicoId = c.MedicoId, HospitalId = c.HospitalId, EspecialidadId = c.EspecialidadId,
                Medico = c.Medico.Nombre + " " + c.Medico.Apellido,
                Hospital = c.Hospital.Nombre, Ciudad = c.Hospital.Ciudad,
                Especialidad = c.Especialidad.Nombre, Fecha = c.Fecha, Hora = c.Hora, Estado = c.Estado
            }).ToListAsync();
        return Ok(lista);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearCitaDto dto)
    {
        var pacienteId = PacienteId;
        if (string.IsNullOrWhiteSpace(pacienteId)) return Unauthorized();
        if (dto.MedicoId <= 0 || dto.HospitalId <= 0 || dto.EspecialidadId <= 0)
            return BadRequest(new { mensaje = "Identificadores inválidos." });
        if (!await RelacionesValidas(dto.MedicoId, dto.HospitalId, dto.EspecialidadId))
            return BadRequest(new { mensaje = "La especialidad o el médico no corresponden a la sucursal." });
        if (!await HorarioValido(dto.MedicoId, dto.HospitalId, dto.Fecha, dto.Hora))
            return Conflict(new { mensaje = "La fecha u hora seleccionada ya no está disponible." });

        var cita = new Cita
        {
            PacienteId = pacienteId, MedicoId = dto.MedicoId, HospitalId = dto.HospitalId,
            EspecialidadId = dto.EspecialidadId, Fecha = dto.Fecha, Hora = dto.Hora
        };
        db.Citas.Add(cita);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException e) when (EsConflictoUnico(e))
        { return Conflict(new { mensaje = "Ese horario acaba de ser reservado por otra persona." }); }
        return StatusCode(201, new { cita.Id, cita.Fecha, cita.Hora, cita.Estado });
    }

    [HttpPatch("{id:int}/cancelar")]
    public async Task<IActionResult> Cancelar(int id)
    {
        var pacienteId = PacienteId;
        if (string.IsNullOrWhiteSpace(pacienteId)) return Unauthorized();
        var cita = await db.Citas.FirstOrDefaultAsync(c => c.Id == id && c.PacienteId == pacienteId);
        if (cita is null) return NotFound();
        if (cita.Estado != "Programada") return Conflict(new { mensaje = "La cita ya está cancelada." });
        cita.Estado = "Cancelada";
        await db.SaveChangesAsync();
        return Ok(new { cita.Id, cita.Estado });
    }

    [HttpPatch("{id:int}/reprogramar")]
    public async Task<IActionResult> Reprogramar(int id, [FromBody] ReprogramarCitaDto dto)
    {
        var pacienteId = PacienteId;
        if (string.IsNullOrWhiteSpace(pacienteId)) return Unauthorized();
        var cita = await db.Citas.FirstOrDefaultAsync(c => c.Id == id && c.PacienteId == pacienteId);
        if (cita is null) return NotFound();
        if (cita.Estado != "Programada") return Conflict(new { mensaje = "Una cita cancelada no puede reprogramarse." });
        if (!await HorarioValido(cita.MedicoId, cita.HospitalId, dto.Fecha, dto.Hora, cita.Id))
            return Conflict(new { mensaje = "El nuevo horario no está disponible." });
        cita.Fecha = dto.Fecha;
        cita.Hora = dto.Hora;
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException e) when (EsConflictoUnico(e))
        { return Conflict(new { mensaje = "El horario fue tomado por otra persona." }); }
        return Ok(new { cita.Id, cita.Fecha, cita.Hora, cita.Estado });
    }

    private async Task<bool> RelacionesValidas(int medicoId, int hospitalId, int especialidadId) =>
        await db.Medicos.AnyAsync(m => m.Id == medicoId && m.Activo) &&
        await db.MedicoHospitales.AnyAsync(h => h.MedicoId == medicoId && h.HospitalId == hospitalId) &&
        await db.MedicoEspecialidades.AnyAsync(e => e.MedicoId == medicoId && e.EspecialidadId == especialidadId && e.Especialidad.Activa);

    private async Task<bool> HorarioValido(int medicoId, int hospitalId, DateOnly fecha, TimeOnly hora, int? excluirId = null)
    {
        var ahora = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-4));
        var hoy = DateOnly.FromDateTime(ahora.DateTime);
        if (fecha < hoy || fecha > hoy.AddDays(90) || (fecha == hoy && hora <= TimeOnly.FromDateTime(ahora.DateTime))) return false;
        if (AgendaCalendario.MotivoCierre(fecha, medicoId) is not null) return false;
        var tramos = await db.HorariosMedicos.AsNoTracking().Where(h => h.MedicoId == medicoId && h.HospitalId == hospitalId && h.DiaSemana == (int)fecha.DayOfWeek && h.Activo).ToListAsync();
        var coincide = tramos.Any(t =>
        {
            if (hora < t.HoraInicio || (t.HoraFin.ToTimeSpan() - hora.ToTimeSpan()).TotalMinutes < t.IntervaloMinutos) return false;
            var minutos = (hora.ToTimeSpan() - t.HoraInicio.ToTimeSpan()).TotalMinutes;
            return minutos >= 0 && minutos % t.IntervaloMinutos == 0;
        });
        if (!coincide) return false;
        return !await db.Citas.AnyAsync(c => c.MedicoId == medicoId && c.Fecha == fecha && c.Hora == hora && c.Estado == "Programada" && (!excluirId.HasValue || c.Id != excluirId.Value));
    }

    private static bool EsConflictoUnico(DbUpdateException e) => e.InnerException is SqlException sql && sql.Number is 2601 or 2627;
}
