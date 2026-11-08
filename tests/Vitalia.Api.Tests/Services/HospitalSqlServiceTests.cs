
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Vitalia.Api.Services;
using Xunit;

namespace Vitalia.Api.Tests.Services;

public class HospitalSqlServiceTests
{
    [Fact]
    public void ObtenerHospitales_DebeConsultarBaseDatosDePrueba()
    {
        // Arrange: crear una base SQLite temporal
        using var conexion = new SqliteConnection("Data Source=:memory:");
        conexion.Open();

        var opciones = new DbContextOptionsBuilder<VitaliaDbContext>()
            .UseSqlite(conexion)
            .Options;

        using var contexto = new VitaliaDbContext(opciones);

        contexto.Database.EnsureCreated();

        // Insertar hospitales ficticios
        contexto.Hospitales.AddRange(
            new Hospital
            {
                Nombre = "Hospital de Prueba A",
                Ciudad = "Santo Domingo"
            },
            new Hospital
            {
                Nombre = "Hospital de Prueba B",
                Ciudad = "Santiago"
            }
        );

        contexto.SaveChanges();

        var servicio = new HospitalSqlService(contexto);

        // Act: consultar usando el servicio SQL
        var hospitales = servicio.ObtenerHospitales();

        // Assert: verificar los resultados
        Assert.Equal(2, hospitales.Count);
        Assert.Equal("Hospital de Prueba A", hospitales[0].Nombre);
        Assert.Equal("Hospital de Prueba B", hospitales[1].Nombre);
    }

    
[Fact]
public void ObtenerHospitalPorId_DebeEncontrarHospitalEnBaseDeDatos()
{
    // Arrange: crear una base de datos temporal
    using var conexion = new SqliteConnection("Data Source=:memory:");
    conexion.Open();

    var opciones = new DbContextOptionsBuilder<VitaliaDbContext>()
        .UseSqlite(conexion)
        .Options;

    using var contexto = new VitaliaDbContext(opciones);
    contexto.Database.EnsureCreated();

    // Crear un hospital ficticio
    var hospital = new Hospital
    {
        Nombre = "Hospital de Prueba Bávaro",
        Ciudad = "Bávaro"
    };

    contexto.Hospitales.Add(hospital);
    contexto.SaveChanges();

    var servicio = new HospitalSqlService(contexto);

    // Act: buscar el hospital por ID
    var resultado = servicio.ObtenerHospitalPorId(hospital.Id);

    // Assert: verificar el resultado
    Assert.NotNull(resultado);
    Assert.Equal(hospital.Id, resultado.Id);
    Assert.Equal("Hospital de Prueba Bávaro", resultado.Nombre);
    Assert.Equal("Bávaro", resultado.Ciudad);
}


[Fact]
public void ObtenerHospitalPorId_DebeDevolverNullSiNoExiste()
{
    // Arrange: crear una base de datos temporal
    using var conexion = new SqliteConnection("Data Source=:memory:");
    conexion.Open();

    var opciones = new DbContextOptionsBuilder<VitaliaDbContext>()
        .UseSqlite(conexion)
        .Options;

    using var contexto = new VitaliaDbContext(opciones);
    contexto.Database.EnsureCreated();

    // Insertar un hospital ficticio
    contexto.Hospitales.Add(new Hospital
    {
        Nombre = "Hospital de Prueba",
        Ciudad = "Santo Domingo"
    });

    contexto.SaveChanges();

    var servicio = new HospitalSqlService(contexto);

    // Act: buscar un hospital inexistente
    var resultado = servicio.ObtenerHospitalPorId(999);

    // Assert: comprobar que no existe
    Assert.Null(resultado);
}


}
