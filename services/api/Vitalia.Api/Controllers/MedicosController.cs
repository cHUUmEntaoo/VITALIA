using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.DTOs;
using Vitalia.Api.Models;
using Vitalia.Api.Services;

namespace Vitalia.Api.Controllers;

[ApiController]
[Route("api/medicos")]
public sealed class MedicosController(VitaliaDbContext db) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Listar([FromQuery] int? hospitalId, [FromQuery] int? especialidadId)
    {
        if (hospitalId is <= 0 || especialidadId is <= 0)
            return BadRequest(new { mensaje = "Los identificadores deben ser positivos." });

        var query = db.Medicos.AsNoTracking().Where(m => m.Activo);
        if (hospitalId.HasValue)
            query = query.Where(m => db.MedicoHospitales.Any(h => h.MedicoId == m.Id && h.HospitalId == hospitalId.Value));
        if (especialidadId.HasValue)
            query = query.Where(m => db.MedicoEspecialidades.Any(e => e.MedicoId == m.Id && e.EspecialidadId == especialidadId.Value && e.Especialidad.Activa));

        var medicos = await query.OrderBy(m => m.Apellido).ThenBy(m => m.Nombre)
            .Select(m => new
            {
                m.Id, m.Nombre, m.Apellido, m.FotoUrl, m.NumeroExequatur,
                HospitalIds = db.MedicoHospitales.Where(h => h.MedicoId == m.Id).Select(h => h.HospitalId).ToList(),
                EspecialidadIds = db.MedicoEspecialidades.Where(e => e.MedicoId == m.Id && e.Especialidad.Activa).Select(e => e.EspecialidadId).ToList()
            }).ToListAsync();
        return Ok(medicos);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> PorId(int id)
    {
        var medico = await db.Medicos.AsNoTracking().Where(m => m.Id == id && m.Activo)
            .Select(m => new
            {
                m.Id, m.Nombre, m.Apellido, m.FotoUrl, m.NumeroExequatur,
                HospitalIds = db.MedicoHospitales.Where(h => h.MedicoId == m.Id).Select(h => h.HospitalId).ToList(),
                EspecialidadIds = db.MedicoEspecialidades.Where(e => e.MedicoId == m.Id).Select(e => e.EspecialidadId).ToList()
            }).FirstOrDefaultAsync();
        return medico is null ? NotFound() : Ok(medico);
    }

    // Solo un administrador puede crear los profesionales. No se inventan identidades.
    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Crear([FromBody] MedicoCrearDto datos)
    {
        var hospitales = datos.HospitalIds.Distinct().ToArray();
        var especialidades = datos.EspecialidadIds.Distinct().ToArray();
        if (hospitales.Length == 0 || especialidades.Length == 0 || hospitales.Any(id => id <= 0) || especialidades.Any(id => id <= 0))
            return BadRequest(new { mensaje = "Indica hospitales y especialidades válidos." });
        if (await db.Hospitales.CountAsync(h => hospitales.Contains(h.Id)) != hospitales.Length ||
            await db.Especialidades.CountAsync(e => especialidades.Contains(e.Id) && e.Activa) != especialidades.Length)
            return BadRequest(new { mensaje = "Hospital o especialidad no existente o inactiva." });

        var medico = new Medico
        {
            Nombre = datos.Nombre.Trim(), Apellido = datos.Apellido.Trim(),
            NumeroExequatur = datos.NumeroExequatur?.Trim(), FotoUrl = datos.FotoUrl?.Trim(), Activo = true
        };
        for (var indice = 0; indice < hospitales.Length; indice++)
        {
            var hospitalId = hospitales[indice];
            db.MedicoHospitales.Add(new MedicoHospital { Medico = medico, HospitalId = hospitalId });
            // Horario de demostración: rotar días para no mostrar al médico en dos sedes a la vez.
            for (var dia = 1; dia <= 5; dia++)
            {
                if ((dia - 1) % hospitales.Length != indice) continue;
                db.HorariosMedicos.Add(new HorarioMedico { Medico = medico, HospitalId = hospitalId, DiaSemana = dia, HoraInicio = new(8, 0), HoraFin = new(12, 0) });
                db.HorariosMedicos.Add(new HorarioMedico { Medico = medico, HospitalId = hospitalId, DiaSemana = dia, HoraInicio = new(13, 0), HoraFin = new(17, 0) });
            }
        }
        foreach (var especialidadId in especialidades)
            db.MedicoEspecialidades.Add(new MedicoEspecialidad { Medico = medico, EspecialidadId = especialidadId });

        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(PorId), new { id = medico.Id }, new { medico.Id, medico.Nombre, medico.Apellido });
    }

    [HttpPut("{medicoId:int}/horarios")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ReemplazarHorarios(int medicoId, [FromBody] ReemplazarHorariosDto datos)
    {
        if (!await db.Medicos.AnyAsync(m => m.Id == medicoId)) return NotFound();
        var hospitales = await db.MedicoHospitales.Where(h => h.MedicoId == medicoId)
            .Select(h => h.HospitalId).ToListAsync();
        if (datos.Horarios.Any(h => !hospitales.Contains(h.HospitalId) || h.DiaSemana is < 1 or > 6 || h.HoraFin <= h.HoraInicio || h.IntervaloMinutos is < 10 or > 120))
            return BadRequest(new { mensaje = "Los horarios deben ser válidos y pertenecer a las sucursales del médico." });
        var solapados = datos.Horarios.GroupBy(h => h.DiaSemana)
            .Any(g => g.OrderBy(h => h.HoraInicio).Zip(g.OrderBy(h => h.HoraInicio).Skip(1), (a, b) => a.HoraFin > b.HoraInicio).Any(x => x));
        if (solapados) return BadRequest(new { mensaje = "Existen tramos horarios solapados." });

        // Política conservadora: no sustituir turnos de un profesional con reservas futuras.
        // Evita que un intervalo nuevo se solape con una reserva previa de otra duración.
        var ahoraLocal = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-4));
        var hoyLocal = DateOnly.FromDateTime(ahoraLocal.DateTime);
        var horaActual = TimeOnly.FromDateTime(ahoraLocal.DateTime);
        if (await db.Citas.AsNoTracking().AnyAsync(c => c.MedicoId == medicoId && c.Estado == "Programada" &&
            (c.Fecha > hoyLocal || (c.Fecha == hoyLocal && c.Hora > horaActual))))
            return Conflict(new { mensaje = "El médico tiene citas futuras. Reprograma esas citas antes de sustituir los horarios." });

        await using var tx = await db.Database.BeginTransactionAsync();
        await db.HorariosMedicos.Where(h => h.MedicoId == medicoId).ExecuteDeleteAsync();
        foreach (var h in datos.Horarios)
            db.HorariosMedicos.Add(new HorarioMedico
            {
                MedicoId = medicoId, HospitalId = h.HospitalId, DiaSemana = h.DiaSemana,
                HoraInicio = h.HoraInicio, HoraFin = h.HoraFin,
                IntervaloMinutos = h.IntervaloMinutos, Activo = true
            });
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return NoContent();
    }

    [HttpGet("{medicoId:int}/disponibilidad")]
    [AllowAnonymous]
    public async Task<IActionResult> Disponibilidad(int medicoId, [FromQuery] int hospitalId, [FromQuery] DateOnly fecha)
    {
        var ahora = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-4));
        var hoy = DateOnly.FromDateTime(ahora.DateTime);
        if (hospitalId <= 0 || fecha < hoy || fecha > hoy.AddDays(90))
            return BadRequest(new { mensaje = "Selecciona un hospital y una fecha en los próximos 90 días." });
        if (!await db.Medicos.AnyAsync(m => m.Id == medicoId && m.Activo) ||
            !await db.MedicoHospitales.AnyAsync(h => h.MedicoId == medicoId && h.HospitalId == hospitalId))
            return NotFound(new { mensaje = "Médico no disponible en esa sucursal." });

        var motivo = AgendaCalendario.MotivoCierre(fecha, medicoId);
        if (motivo is not null)
            return Ok(new { medicoId, hospitalId, fecha, zonaHoraria = "America/Santo_Domingo", horas = Array.Empty<string>(), bloqueado = true, motivo });
        var horas = await HorasDisponibles(db, medicoId, hospitalId, fecha);
        return Ok(new { medicoId, hospitalId, fecha, zonaHoraria = "America/Santo_Domingo", horas });
    }

    internal static async Task<List<string>> HorasDisponibles(VitaliaDbContext db, int medicoId, int hospitalId, DateOnly fecha)
    {
        var tramos = await db.HorariosMedicos.AsNoTracking().Where(h => h.MedicoId == medicoId && h.HospitalId == hospitalId && h.DiaSemana == (int)fecha.DayOfWeek && h.Activo)
            .OrderBy(h => h.HoraInicio).ToListAsync();
        var reservadas = await db.Citas.AsNoTracking().Where(c => c.MedicoId == medicoId && c.Fecha == fecha && c.Estado == "Programada")
            .Select(c => c.Hora).ToListAsync();
        var ocupadas = reservadas.ToHashSet();
        var ahora = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-4));
        var hoy = DateOnly.FromDateTime(ahora.DateTime);
        var horas = new SortedSet<TimeOnly>();
        foreach (var tramo in tramos)
        {
            for (var h = tramo.HoraInicio; (tramo.HoraFin.ToTimeSpan() - h.ToTimeSpan()).TotalMinutes >= tramo.IntervaloMinutos; h = h.AddMinutes(tramo.IntervaloMinutos))
            {
                if (!ocupadas.Contains(h) && (fecha > hoy || h > TimeOnly.FromDateTime(ahora.DateTime)))
                    horas.Add(h);
            }
        }
        return horas.Select(h => h.ToString("HH:mm")).ToList();
    }
}
