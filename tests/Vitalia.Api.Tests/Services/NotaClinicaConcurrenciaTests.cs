using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Xunit;

namespace Vitalia.Api.Tests.Services;

public sealed class NotaClinicaConcurrenciaTests
{
    [Fact]
    public async Task BorradorObsoleto_NoPuedeModificarUnaNotaFirmada()
    {
        await using var conexion = new SqliteConnection("Data Source=:memory:");
        await conexion.OpenAsync();
        var opciones = new DbContextOptionsBuilder<VitaliaDbContext>()
            .UseSqlite(conexion).Options;

        int notaId;
        await using (var db = new VitaliaDbContext(opciones))
        {
            await db.Database.EnsureCreatedAsync();

            var paciente = new Usuario
            {
                Id = "paciente-demo-concurrencia",
                UserName = "paciente-demo-concurrencia",
                Nombre = "Paciente",
                Apellido = "Demo"
            };
            var hospital = new Hospital { Nombre = "Centro Demo", Ciudad = "Santiago" };
            var especialidad = new Especialidad { Nombre = "Neurologia Demo", Activa = true };
            var medico = new Medico { Nombre = "Medico", Apellido = "Demo" };
            db.Users.Add(paciente);
            db.Hospitales.Add(hospital);
            db.Especialidades.Add(especialidad);
            db.Medicos.Add(medico);
            await db.SaveChangesAsync();

            var cita = new Cita
            {
                PacienteId = paciente.Id,
                MedicoId = medico.Id,
                HospitalId = hospital.Id,
                EspecialidadId = especialidad.Id,
                Fecha = new DateOnly(2026, 11, 26),
                Hora = new TimeOnly(8, 0)
            };
            db.Citas.Add(cita);
            await db.SaveChangesAsync();

            var nota = new NotaClinica
            {
                CitaId = cita.Id,
                PacienteId = paciente.Id,
                MedicoId = medico.Id,
                MotivoConsulta = "Consulta ficticia",
                Diagnostico = "Diagnostico original",
                Plan = "Plan original"
            };
            db.NotasClinicas.Add(nota);
            await db.SaveChangesAsync();
            notaId = nota.Id;
        }

        await using var editorObsoleto = new VitaliaDbContext(opciones);
        await using var firmante = new VitaliaDbContext(opciones);

        var borrador = await editorObsoleto.NotasClinicas.SingleAsync(n => n.Id == notaId);
        var firma = await firmante.NotasClinicas.SingleAsync(n => n.Id == notaId);
        firma.FirmadaUtc = DateTime.UtcNow;
        await firmante.SaveChangesAsync();

        borrador.Diagnostico = "Diagnostico obsoleto";
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(
            () => editorObsoleto.SaveChangesAsync());

        await using var verificacion = new VitaliaDbContext(opciones);
        var notaFinal = await verificacion.NotasClinicas.AsNoTracking()
            .SingleAsync(n => n.Id == notaId);
        Assert.NotNull(notaFinal.FirmadaUtc);
        Assert.Equal("Diagnostico original", notaFinal.Diagnostico);
    }
}
