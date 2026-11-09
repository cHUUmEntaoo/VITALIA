
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Xunit;

namespace Vitalia.Api.Tests.Services;

public class HospitalSeederTests
{
    [Fact]
    public void Seed_DebeInsertarHospitalesSinDuplicarlos()
    {
        // Arrange: crear una base de datos temporal vacía
        using var conexion = new SqliteConnection("Data Source=:memory:");
        conexion.Open();

        var opciones = new DbContextOptionsBuilder<VitaliaDbContext>()
            .UseSqlite(conexion)
            .Options;

        using var contexto = new VitaliaDbContext(opciones);
        contexto.Database.EnsureCreated();

        // Verificar que inicialmente no hay hospitales
        Assert.Empty(contexto.Hospitales);

        // Act: ejecutar el seeder por primera vez
        HospitalSeeder.Seed(contexto);

        // Assert: comprobar que insertó los tres hospitales
        Assert.Equal(3, contexto.Hospitales.Count());

        var nombres = contexto.Hospitales
            .Select(h => h.Nombre)
            .ToList();

        Assert.Contains("Centro VITALIA Santo Domingo", nombres);
        Assert.Contains("Centro VITALIA Bávaro", nombres);
        Assert.Contains("Centro VITALIA Santiago", nombres);

        // Act: ejecutar nuevamente el seeder
        HospitalSeeder.Seed(contexto);

        // Assert: comprobar que no creó duplicados
        Assert.Equal(3, contexto.Hospitales.Count());
    }

    
[Fact]
public void Seed_DebeInsertarSoloElHospitalFaltante()
{
    // Arrange: crear una base de datos temporal
    using var conexion = new SqliteConnection("Data Source=:memory:");
    conexion.Open();

    var opciones = new DbContextOptionsBuilder<VitaliaDbContext>()
        .UseSqlite(conexion)
        .Options;

    using var contexto = new VitaliaDbContext(opciones);
    contexto.Database.EnsureCreated();

    // Insertar solamente dos hospitales
    contexto.Hospitales.AddRange(
        new Hospital
        {
            Nombre = "Centro VITALIA Santo Domingo",
            Ciudad = "Santo Domingo"
        },
        new Hospital
        {
            Nombre = "Centro VITALIA Bávaro",
            Ciudad = "Bávaro"
        }
    );

    contexto.SaveChanges();

    // Act: ejecutar el seeder
    HospitalSeeder.Seed(contexto);

    // Assert: deben existir exactamente tres hospitales
    Assert.Equal(3, contexto.Hospitales.Count());

    // Comprobar que cada hospital aparece una sola vez
    Assert.Equal(1, contexto.Hospitales.Count(
        h => h.Nombre == "Centro VITALIA Santo Domingo"));

    Assert.Equal(1, contexto.Hospitales.Count(
        h => h.Nombre == "Centro VITALIA Bávaro"));

    Assert.Equal(1, contexto.Hospitales.Count(
        h => h.Nombre == "Centro VITALIA Santiago"));
}

}
