using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Vitalia.Api.Services;

namespace Vitalia.Api.Controllers;

// MVP institucional: agenda, administración de personal y recepción.
// La historia clínica, el vínculo de recepción a sedes y la auditoría sanitaria
// requieren módulos propios antes de usar el sistema con pacientes reales.
[ApiController]
[Authorize(Roles = "Administrador,Medico,Recepcionista")]
[Route("api/institucional")]
public sealed class InstitucionalController(
    VitaliaDbContext db,
    UserManager<Usuario> usuarios) : ControllerBase
{
    private string? UsuarioId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("resumen")]
    public async Task<IActionResult> Resumen()
    {
        var medicoId = await MedicoActualId();
        var esMedico = User.IsInRole("Medico") && !User.IsInRole("Administrador") && !User.IsInRole("Recepcionista");
        if (esMedico && medicoId is null) return Ok(new { medicos = 0, pacientes = 0, citas = 0, programadas = 0, vinculacionPendiente = true });
        var citas = db.Citas.AsNoTracking();
        if (esMedico) citas = citas.Where(c => c.MedicoId == medicoId);
        return Ok(new
        {
            medicos = esMedico ? 1 : await db.Medicos.CountAsync(m => m.Activo),
            pacientes = esMedico ? 0 : await db.Users.CountAsync(u =>
                db.UserRoles.Any(ur => ur.UserId == u.Id &&
                    db.Roles.Any(r => r.Id == ur.RoleId && r.Name == "Paciente"))),
            citas = await citas.CountAsync(),
            programadas = await citas.CountAsync(c => c.Estado == "Programada"),
            vinculacionPendiente = false
        });
    }

    [HttpGet("citas")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Citas([FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta)
    {
        var desdeFecha = desde ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        var hastaFecha = hasta ?? desdeFecha.AddDays(90);
        if (hastaFecha < desdeFecha || hastaFecha.DayNumber - desdeFecha.DayNumber > 365)
            return BadRequest(new { mensaje = "Selecciona un intervalo válido de hasta 365 días." });
        var citas = await db.Citas.AsNoTracking()
            .Where(c => c.Fecha >= desdeFecha && c.Fecha <= hastaFecha)
            .OrderBy(c => c.Fecha).ThenBy(c => c.Hora)
            .Take(500)
            .Select(c => new
            {
                c.Id, c.Fecha, c.Hora, c.Estado, c.PacienteId,
                Paciente = c.Paciente.Nombre + " " + c.Paciente.Apellido,
                Telefono = c.Paciente.PhoneNumber,
                Medico = c.Medico.Nombre + " " + c.Medico.Apellido,
                c.MedicoId, c.HospitalId,
                Hospital = c.Hospital.Nombre, Especialidad = c.Especialidad.Nombre
            }).ToListAsync();
        return Ok(citas);
    }

    [HttpGet("pacientes")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Pacientes()
    {
        var rolPaciente = await db.Roles.AsNoTracking().Where(r => r.Name == "Paciente")
            .Select(r => r.Id).FirstOrDefaultAsync();
        if (rolPaciente is null) return Ok(Array.Empty<object>());
        var datos = await db.Users.AsNoTracking()
            .Where(u => db.UserRoles.Any(ur => ur.UserId == u.Id && ur.RoleId == rolPaciente))
            .OrderBy(u => u.Apellido).ThenBy(u => u.Nombre)
            .Take(500)
            .Select(u => new { u.Id, u.Nombre, u.Apellido, Correo = u.Email, Telefono = u.PhoneNumber })
            .ToListAsync();
        return Ok(datos);
    }

    [HttpGet("medicos/{id:int}/horarios")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Horarios(int id)
    {
        if (!await db.Medicos.AnyAsync(m => m.Id == id)) return NotFound();
        return Ok(await db.HorariosMedicos.AsNoTracking().Where(h => h.MedicoId == id)
            .OrderBy(h => h.DiaSemana).ThenBy(h => h.HoraInicio)
            .Select(h => new { h.Id, h.HospitalId, h.DiaSemana, h.HoraInicio, h.HoraFin, h.IntervaloMinutos })
            .ToListAsync());
    }

    [HttpGet("mi-agenda")]
    [Authorize(Roles = "Medico")]
    public async Task<IActionResult> MiAgenda()
    {
        var medicoId = await MedicoActualId();
        if (medicoId is null) return Conflict(new { mensaje = "Tu usuario no está vinculado a un médico. Solicita al administrador que complete el vínculo." });
        var fechaInicio = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        return Ok(await db.Citas.AsNoTracking()
            .Where(c => c.MedicoId == medicoId && c.Fecha >= fechaInicio)
            .OrderBy(c => c.Fecha).ThenBy(c => c.Hora)
            .Take(500)
            .Select(c => new
            {
                c.Id, c.Fecha, c.Hora, c.Estado,
                Paciente = c.Paciente.Nombre + " " + c.Paciente.Apellido,
                Hospital = c.Hospital.Nombre,
                Especialidad = c.Especialidad.Nombre
            }).ToListAsync());
    }

    [HttpPatch("mi-agenda/{id:int}/atender")]
    [Authorize(Roles = "Medico")]
    public IActionResult Atender(int id)
    {
        // La firma del registro clinico es el unico flujo permitido para atender.
        // Este endpoint anterior queda explicitamente deshabilitado.
        return Conflict(new { mensaje = "Abre la consulta clinica, guarda la nota y usa 'Firmar y finalizar'." });
    }

    [HttpPatch("citas/{id:int}/cancelar")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Cancelar(int id)
    {
        var cita = await db.Citas.FirstOrDefaultAsync(c => c.Id == id);
        if (cita is null) return NotFound();
        if (cita.Estado != "Programada") return Conflict(new { mensaje = "La cita ya no está programada." });
        if (await db.NotasClinicas.AnyAsync(n => n.CitaId == cita.Id))
            return Conflict(new { mensaje = "La cita tiene documentación clínica y no puede cancelarse desde recepción." });
        cita.Estado = "Cancelada";
        await db.SaveChangesAsync();
        return Ok(new { cita.Id, cita.Estado });
    }

    [HttpPost("citas")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Reservar([FromBody] ReservaInstitucionalDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var paciente = await usuarios.FindByIdAsync(dto.PacienteId);
        if (paciente is null || !await usuarios.IsInRoleAsync(paciente, "Paciente"))
            return BadRequest(new { mensaje = "Selecciona un paciente válido." });
        if (!await db.Medicos.AnyAsync(m => m.Id == dto.MedicoId && m.Activo) ||
            !await db.MedicoHospitales.AnyAsync(h => h.MedicoId == dto.MedicoId && h.HospitalId == dto.HospitalId) ||
            !await db.MedicoEspecialidades.AnyAsync(e => e.MedicoId == dto.MedicoId && e.EspecialidadId == dto.EspecialidadId && e.Especialidad.Activa))
            return BadRequest(new { mensaje = "El médico no atiende esta especialidad en la sede elegida." });

        var ahora = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-4));
        var hoy = DateOnly.FromDateTime(ahora.DateTime);
        if (dto.Fecha < hoy || dto.Fecha > hoy.AddDays(90) ||
            (dto.Fecha == hoy && dto.Hora <= TimeOnly.FromDateTime(ahora.DateTime)))
            return BadRequest(new { mensaje = "La fecha u hora no es válida." });
        var motivoCierre = AgendaCalendario.MotivoCierre(dto.Fecha, dto.MedicoId);
        if (motivoCierre is not null) return Conflict(new { mensaje = motivoCierre });
        var tramos = await db.HorariosMedicos.AsNoTracking()
            .Where(h => h.MedicoId == dto.MedicoId && h.HospitalId == dto.HospitalId && h.DiaSemana == (int)dto.Fecha.DayOfWeek && h.Activo)
            .ToListAsync();
        var horarioValido = tramos.Any(h =>
        {
            if (h.IntervaloMinutos <= 0 || dto.Hora < h.HoraInicio ||
                (h.HoraFin.ToTimeSpan() - dto.Hora.ToTimeSpan()).TotalMinutes < h.IntervaloMinutos)
                return false;
            var diferencia = (dto.Hora.ToTimeSpan() - h.HoraInicio.ToTimeSpan()).TotalMinutes;
            return diferencia >= 0 && diferencia % h.IntervaloMinutos == 0;
        });
        if (!horarioValido) return Conflict(new { mensaje = "El horario ya no está disponible." });

        var cita = new Cita
        {
            PacienteId = dto.PacienteId, MedicoId = dto.MedicoId,
            HospitalId = dto.HospitalId, EspecialidadId = dto.EspecialidadId,
            Fecha = dto.Fecha, Hora = dto.Hora
        };
        db.Citas.Add(cita);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException e) when (e.InnerException is SqlException sql && sql.Number is 2601 or 2627)
        { return Conflict(new { mensaje = "El horario acaba de ser reservado." }); }
        return Created($"/api/institucional/citas/{cita.Id}", new { cita.Id, cita.Estado });
    }

    [HttpPost("personal")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> CrearPersonal([FromBody] CrearPersonalDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (dto.Rol is not ("Medico" or "Recepcionista"))
            return BadRequest(new { mensaje = "Rol institucional no permitido." });
        Medico? medico = null;
        if (dto.Rol == "Medico")
        {
            if (dto.MedicoId is null) return BadRequest(new { mensaje = "Selecciona el profesional al que corresponde la cuenta." });
            medico = await db.Medicos.FirstOrDefaultAsync(m => m.Id == dto.MedicoId && m.Activo);
            if (medico is null || medico.UsuarioId is not null)
                return Conflict(new { mensaje = "El médico no existe o ya tiene una cuenta vinculada." });
        }
        else if (dto.MedicoId is not null)
            return BadRequest(new { mensaje = "Una cuenta de recepción no puede vincularse a un médico." });

        var correo = dto.Correo.Trim();
        if (await usuarios.FindByEmailAsync(correo) is not null)
            return Conflict(new { mensaje = "Ya existe una cuenta para ese correo." });

        await using var transaccion = await db.Database.BeginTransactionAsync();
        var usuario = new Usuario
        {
            Nombre = dto.Nombre.Trim(), Apellido = dto.Apellido.Trim(),
            UserName = correo, Email = correo, FechaRegistroUtc = DateTime.UtcNow
        };
        var creado = await usuarios.CreateAsync(usuario, dto.Contrasena);
        if (!creado.Succeeded)
            return BadRequest(new { mensaje = "El correo o la contraseña no cumplen las políticas de seguridad." });
        var rol = await usuarios.AddToRoleAsync(usuario, dto.Rol);
        if (!rol.Succeeded)
            return StatusCode(500, new { mensaje = "No se pudo asignar el rol de la cuenta." });
        if (medico is not null)
        {
            medico.UsuarioId = usuario.Id;
            await db.SaveChangesAsync();
        }
        await transaccion.CommitAsync();
        return StatusCode(201, new { usuario.Id, usuario.Nombre, usuario.Apellido, usuario.Email, dto.Rol });
    }

    private async Task<int?> MedicoActualId()
    {
        var id = UsuarioId;
        if (id is null) return null;
        return await db.Medicos.AsNoTracking().Where(m => m.UsuarioId == id && m.Activo)
            .Select(m => (int?)m.Id).FirstOrDefaultAsync();
    }
}

public sealed class ReservaInstitucionalDto
{
    [Required] public string PacienteId { get; set; } = "";
    [Range(1, int.MaxValue)] public int MedicoId { get; set; }
    [Range(1, int.MaxValue)] public int HospitalId { get; set; }
    [Range(1, int.MaxValue)] public int EspecialidadId { get; set; }
    public DateOnly Fecha { get; set; }
    public TimeOnly Hora { get; set; }
}

public sealed class CrearPersonalDto
{
    [Required, StringLength(100, MinimumLength = 2)] public string Nombre { get; set; } = "";
    [Required, StringLength(100, MinimumLength = 2)] public string Apellido { get; set; } = "";
    [Required, EmailAddress] public string Correo { get; set; } = "";
    [Required, MinLength(12)] public string Contrasena { get; set; } = "";
    [Required] public string Rol { get; set; } = "";
    public int? MedicoId { get; set; }
}
