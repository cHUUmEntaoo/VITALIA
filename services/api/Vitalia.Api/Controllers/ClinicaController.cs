using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Vitalia.Api.Data;
using Vitalia.Api.Models;

namespace Vitalia.Api.Controllers;

[ApiController]
[Route("api/clinica")]
[Authorize(Roles = "Medico")]
public sealed class ClinicaController(VitaliaDbContext db) : ControllerBase
{
    private string? UsuarioId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private async Task<int?> MiMedicoId()
    {
        var usuarioId = UsuarioId;
        if (string.IsNullOrEmpty(usuarioId)) return null;
        return await db.Medicos.AsNoTracking()
            .Where(m => m.UsuarioId == usuarioId && m.Activo)
            .Select(m => (int?)m.Id).FirstOrDefaultAsync();
    }

    private static object Proyectar(NotaClinica? nota) => new
    {
        motivoConsulta = nota?.MotivoConsulta ?? "",
        antecedentes = nota?.Antecedentes ?? "",
        hallazgos = nota?.Hallazgos ?? "",
        diagnostico = nota?.Diagnostico ?? "",
        plan = nota?.Plan ?? "",
        indicaciones = nota?.Indicaciones ?? "",
        creadaUtc = nota?.CreadaUtc,
        actualizadaUtc = nota?.ActualizadaUtc,
        firmadaUtc = nota?.FirmadaUtc
    };

    private void Auditar(int citaId, string accion)
    {
        db.AuditoriasClinicas.Add(new AuditoriaClinica
        {
            CitaId = citaId,
            UsuarioId = UsuarioId ?? "",
            Accion = accion,
            FechaUtc = DateTime.UtcNow
        });
    }

    // La cuenta Medico solo puede ver citas vinculadas a su propio profesional.
    [HttpGet("citas/{citaId:int}/nota")]
    public async Task<IActionResult> ObtenerNota(int citaId)
    {
        var medicoId = await MiMedicoId();
        if (medicoId is null) return Forbid();
        var cita = await db.Citas.AsNoTracking()
            .Where(c => c.Id == citaId && c.MedicoId == medicoId)
            .Select(c => new
            {
                c.Id, c.PacienteId, c.Fecha, c.Hora, c.Estado,
                Paciente = c.Paciente.Nombre + " " + c.Paciente.Apellido,
                Hospital = c.Hospital.Nombre,
                Especialidad = c.Especialidad.Nombre
            }).FirstOrDefaultAsync();
        if (cita is null) return NotFound();
        var nota = await db.NotasClinicas.AsNoTracking()
            .FirstOrDefaultAsync(n => n.CitaId == citaId && n.MedicoId == medicoId);
        Auditar(citaId, "LECTURA_NOTA");
        await db.SaveChangesAsync();
        return Ok(new { cita, nota = Proyectar(nota) });
    }

    // No se muestra historial de otros profesionales en este primer modulo.
    [HttpGet("pacientes/{pacienteId}/historial")]
    public async Task<IActionResult> Historial(string pacienteId)
    {
        var medicoId = await MiMedicoId();
        if (medicoId is null) return Forbid();
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(-4));
        var vinculado = await db.Citas.AsNoTracking().AnyAsync(c =>
            c.MedicoId == medicoId && c.PacienteId == pacienteId &&
            c.Estado == "Atendida" && c.Fecha <= hoy);
        if (!vinculado) return NotFound();
        var limite = hoy.AddYears(-8);
        var notas = await db.NotasClinicas.AsNoTracking()
            .Where(n => n.PacienteId == pacienteId && n.MedicoId == medicoId &&
                n.FirmadaUtc != null && n.Cita.Fecha >= limite)
            .OrderByDescending(n => n.Cita.Fecha).ThenByDescending(n => n.Cita.Hora)
            .Take(150)
            .Select(n => new
            {
                n.CitaId, n.Cita.Fecha, n.Cita.Hora, n.Cita.HospitalId,
                n.MotivoConsulta, n.Hallazgos, n.Diagnostico, n.Plan,
                n.Indicaciones, n.FirmadaUtc
            }).ToListAsync();
        // Registrar el acceso aun si no existen notas en el periodo.
        var citaDeVinculo = await db.Citas.AsNoTracking()
            .Where(c => c.MedicoId == medicoId && c.PacienteId == pacienteId && c.Estado == "Atendida")
            .Select(c => c.Id).FirstAsync();
        Auditar(citaDeVinculo, "LECTURA_HISTORIAL");
        await db.SaveChangesAsync();
        return Ok(notas);
    }

    [HttpPut("citas/{citaId:int}/nota")]
    public async Task<IActionResult> GuardarNota(int citaId, [FromBody] NotaClinicaDto datos)
    {
        var medicoId = await MiMedicoId();
        if (medicoId is null) return Forbid();
        var cita = await db.Citas.FirstOrDefaultAsync(c => c.Id == citaId && c.MedicoId == medicoId);
        if (cita is null) return NotFound();
        if (cita.Estado != "Programada")
            return Conflict(new { mensaje = "La cita no admite nuevos cambios clinicos." });
        var ahoraLocal = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-4));
        if (cita.Fecha > DateOnly.FromDateTime(ahoraLocal.DateTime) ||
            (cita.Fecha == DateOnly.FromDateTime(ahoraLocal.DateTime) && cita.Hora > TimeOnly.FromDateTime(ahoraLocal.DateTime)))
            return Conflict(new { mensaje = "La consulta todavia no ha iniciado." });
        if (string.IsNullOrWhiteSpace(datos.MotivoConsulta))
            return BadRequest(new { mensaje = "Escribe el motivo de consulta para guardar el borrador." });

        var nota = await db.NotasClinicas.FirstOrDefaultAsync(n => n.CitaId == citaId);
        if (nota is not null && nota.MedicoId != medicoId) return Forbid();
        if (nota?.FirmadaUtc is not null) return Conflict(new { mensaje = "La nota ya fue firmada." });
        if (nota is null)
        {
            nota = new NotaClinica { CitaId = citaId, MedicoId = medicoId.Value, PacienteId = cita.PacienteId };
            db.NotasClinicas.Add(nota);
        }
        nota.MotivoConsulta = datos.MotivoConsulta.Trim();
        nota.Antecedentes = (datos.Antecedentes ?? "").Trim();
        nota.Hallazgos = (datos.Hallazgos ?? "").Trim();
        nota.Diagnostico = (datos.Diagnostico ?? "").Trim();
        nota.Plan = (datos.Plan ?? "").Trim();
        nota.Indicaciones = (datos.Indicaciones ?? "").Trim();
        nota.ActualizadaUtc = DateTime.UtcNow;
        Auditar(citaId, "GUARDAR_BORRADOR");
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { mensaje = "La nota fue firmada o modificada mientras guardabas; vuelve a consultarla." });
        }
        catch (DbUpdateException error) when (error.InnerException is SqlException sql && sql.Number is 2601 or 2627)
        {
            // Unica nota por cita, tambien ante peticiones concurrentes.
            return Conflict(new { mensaje = "La nota cambio durante la edicion; vuelve a consultarla." });
        }
        return Ok(new { citaId, nota = Proyectar(nota) });
    }

    [HttpPost("citas/{citaId:int}/finalizar")]
    public async Task<IActionResult> Finalizar(int citaId)
    {
        var medicoId = await MiMedicoId();
        if (medicoId is null) return Forbid();
        var cita = await db.Citas.FirstOrDefaultAsync(c => c.Id == citaId && c.MedicoId == medicoId);
        if (cita is null) return NotFound();
        if (cita.Estado != "Programada") return Conflict(new { mensaje = "La cita ya no esta programada." });
        var ahoraLocal = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-4));
        if (cita.Fecha > DateOnly.FromDateTime(ahoraLocal.DateTime) ||
            (cita.Fecha == DateOnly.FromDateTime(ahoraLocal.DateTime) && cita.Hora > TimeOnly.FromDateTime(ahoraLocal.DateTime)))
            return Conflict(new { mensaje = "No puedes finalizar una consulta futura." });
        var nota = await db.NotasClinicas.FirstOrDefaultAsync(n => n.CitaId == citaId && n.MedicoId == medicoId);
        if (nota is null || nota.FirmadaUtc is not null || string.IsNullOrWhiteSpace(nota.MotivoConsulta) ||
            string.IsNullOrWhiteSpace(nota.Diagnostico) || string.IsNullOrWhiteSpace(nota.Plan))
            return Conflict(new { mensaje = "Guarda motivo, diagnostico y plan antes de finalizar." });
        nota.FirmadaUtc = DateTime.UtcNow;
        nota.ActualizadaUtc = DateTime.UtcNow;
        cita.Estado = "Atendida";
        Auditar(citaId, "FIRMAR_Y_ATENDER");
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { mensaje = "La consulta fue firmada simultaneamente; vuelve a abrir la nota." });
        }
        return Ok(new { cita.Id, cita.Estado, nota.FirmadaUtc });
    }
}

public sealed class NotaClinicaDto
{
    [Required, StringLength(2000, MinimumLength = 2)]
    public string MotivoConsulta { get; set; } = "";
    [StringLength(4000)] public string? Antecedentes { get; set; }
    [StringLength(4000)] public string? Hallazgos { get; set; }
    [StringLength(2000)] public string? Diagnostico { get; set; }
    [StringLength(4000)] public string? Plan { get; set; }
    [StringLength(4000)] public string? Indicaciones { get; set; }
}
