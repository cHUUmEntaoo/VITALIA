
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Xunit;

namespace Vitalia.Api.Tests.Services;

public class RoleSeederTests
{
    [Fact]
    public async Task SeedAsync_DebeCrearRolesSinDuplicarlos()
    {
        // Arrange: crear una base de datos temporal
        using var conexion = new SqliteConnection("Data Source=:memory:");
        conexion.Open();

        var servicios = new ServiceCollection();

        servicios.AddLogging();

        servicios.AddDbContext<VitaliaDbContext>(options =>
            options.UseSqlite(conexion));

        servicios
            .AddIdentityCore<Usuario>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<VitaliaDbContext>();

        using var proveedor = servicios.BuildServiceProvider();
        using var scope = proveedor.CreateScope();

        var contexto = scope.ServiceProvider
            .GetRequiredService<VitaliaDbContext>();

        contexto.Database.EnsureCreated();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        // Act: ejecutar el seeder
        await RoleSeeder.SeedAsync(roleManager);

        // Assert: verificar que existen los cuatro roles
        Assert.Equal(4, await contexto.Roles.CountAsync());

        Assert.True(await roleManager.RoleExistsAsync("Administrador"));
        Assert.True(await roleManager.RoleExistsAsync("Medico"));
        Assert.True(await roleManager.RoleExistsAsync("Recepcionista"));
        Assert.True(await roleManager.RoleExistsAsync("Paciente"));

        // Act: volver a ejecutar el seeder
        await RoleSeeder.SeedAsync(roleManager);

        // Assert: comprobar que no se duplicaron
        Assert.Equal(4, await contexto.Roles.CountAsync());
    }


[Fact]
public async Task SeedAsync_DebeCrearSoloElRolFaltante()
{
    // Arrange: crear una base de datos temporal
    using var conexion = new SqliteConnection("Data Source=:memory:");
    conexion.Open();

    var servicios = new ServiceCollection();

    servicios.AddLogging();

    servicios.AddDbContext<VitaliaDbContext>(options =>
        options.UseSqlite(conexion));

    servicios
        .AddIdentityCore<Usuario>()
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<VitaliaDbContext>();

    using var proveedor = servicios.BuildServiceProvider();
    using var scope = proveedor.CreateScope();

    var contexto = scope.ServiceProvider
        .GetRequiredService<VitaliaDbContext>();

    contexto.Database.EnsureCreated();

    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    // Crear solamente tres roles
    string[] rolesExistentes =
    {
        "Administrador",
        "Medico",
        "Paciente"
    };

    foreach (var nombre in rolesExistentes)
    {
        var resultado = await roleManager.CreateAsync(
            new IdentityRole(nombre));

        Assert.True(resultado.Succeeded);
    }

    Assert.Equal(3, await contexto.Roles.CountAsync());

    Assert.False(
        await roleManager.RoleExistsAsync("Recepcionista"));

    // Act: ejecutar nuestro seeder
    await RoleSeeder.SeedAsync(roleManager);

    // Assert: deben existir exactamente cuatro roles
    Assert.Equal(4, await contexto.Roles.CountAsync());

    foreach (var nombre in rolesExistentes)
    {
        Assert.True(await roleManager.RoleExistsAsync(nombre));
    }

    Assert.True(
        await roleManager.RoleExistsAsync("Recepcionista"));
}

}
