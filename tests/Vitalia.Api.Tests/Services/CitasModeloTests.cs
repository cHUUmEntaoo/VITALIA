using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Xunit;

namespace Vitalia.Api.Tests.Services;

public class CitasModeloTests
{
    [Fact]
    public async Task MismoMedicoMismaFechaYHora_NoPermiteDosCitasProgramadas()
    {
        await using var conexion = new SqliteConnection("Data Source=:memory:");
        await conexion.OpenAsync();
        var opciones = new DbContextOptionsBuilder<VitaliaDbContext>().UseSqlite(conexion).Options;
        await using var db = new VitaliaDbContext(opciones);
        await db.Database.EnsureCreatedAsync();

        var paciente = new Usuario { Id = "paciente-prueba", UserName = "paciente-prueba", Nombre = "Prueba", Apellido = "Paciente" };
        var hospital = new Hospital { Nombre = "Hospital Prueba", Ciudad = "Santo Domingo" };
        var especialidad = new Especialidad { Nombre = "Cardiología Prueba", Activa = true };
        var medico = new Medico { Nombre = "Medico", Apellido = "Prueba" };
        db.Users.Add(paciente);
        db.Hospitales.Add(hospital);
        db.Especialidades.Add(especialidad);
        db.Medicos.Add(medico);
        await db.SaveChangesAsync();

        var fecha = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3));
        var hora = new TimeOnly(9, 0);
        db.Citas.Add(new Cita
        {
            PacienteId = paciente.Id, MedicoId = medico.Id, HospitalId = hospital.Id,
            EspecialidadId = especialidad.Id, Fecha = fecha, Hora = hora
        });
        await db.SaveChangesAsync();

        db.Citas.Add(new Cita
        {
            PacienteId = paciente.Id, MedicoId = medico.Id, HospitalId = hospital.Id,
            EspecialidadId = especialidad.Id, Fecha = fecha, Hora = hora
        });
        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }
}
