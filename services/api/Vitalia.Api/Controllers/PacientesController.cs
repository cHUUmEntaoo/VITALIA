using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.DTOs;
using Vitalia.Api.Models;

namespace Vitalia.Api.Controllers;

[ApiController]
[Authorize(Roles = "Paciente")]
[Route("api/pacientes")]
public sealed class PacientesController(VitaliaDbContext db, UserManager<Usuario> usuarios) : ControllerBase
{
    [HttpGet("mi-perfil")]
    public async Task<IActionResult> MiPerfil()
    {
        var usuario = await Actual();
        if (usuario is null) return Unauthorized();
        var datos = await db.PerfilesPacientes.AsNoTracking().FirstOrDefaultAsync(p => p.PacienteId == usuario.Id);
        return Ok(Respuesta(usuario, datos));
    }

    [HttpPut("mi-perfil")]
    public async Task<IActionResult> Guardar([FromBody] ActualizarPerfilDto dto)
    {
        var usuario = await Actual();
        if (usuario is null) return Unauthorized();
        if (dto.TieneSeguro && (string.IsNullOrWhiteSpace(dto.Aseguradora) || string.IsNullOrWhiteSpace(dto.NumeroAfiliacion)))
            return BadRequest(new { mensaje = "Completa los datos del seguro o selecciona que no tienes seguro." });

        await using var tx = await db.Database.BeginTransactionAsync();
        usuario.Nombre = dto.Nombre.Trim();
        usuario.Apellido = dto.Apellido.Trim();
        usuario.PhoneNumber = dto.Telefono?.Trim();
        var actualizado = await usuarios.UpdateAsync(usuario);
        if (!actualizado.Succeeded) return BadRequest(new { mensaje = "No se pudo actualizar el perfil." });
        var perfil = await db.PerfilesPacientes.FirstOrDefaultAsync(p => p.PacienteId == usuario.Id);
        if (perfil is null)
        {
            perfil = new PerfilPaciente { PacienteId = usuario.Id };
            db.PerfilesPacientes.Add(perfil);
        }
        perfil.TieneSeguro = dto.TieneSeguro;
        perfil.Aseguradora = dto.TieneSeguro ? dto.Aseguradora?.Trim() : null;
        perfil.NumeroAfiliacion = dto.TieneSeguro ? dto.NumeroAfiliacion?.Trim() : null;
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Ok(Respuesta(usuario, perfil));
    }

    private async Task<Usuario?> Actual()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return string.IsNullOrWhiteSpace(id) ? null : await usuarios.FindByIdAsync(id);
    }

    private static object Respuesta(Usuario u, PerfilPaciente? p) => new
    {
        u.Id, u.Nombre, u.Apellido, Correo = u.Email, Telefono = u.PhoneNumber,
        TieneSeguro = p?.TieneSeguro ?? false,
        Aseguradora = p?.Aseguradora,
        NumeroAfiliacion = p?.NumeroAfiliacion
    };
}
