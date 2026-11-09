
using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Vitalia.Api.Data;
using Vitalia.Api.Services.Interfaces;



namespace Vitalia.Api.Tests.Integration;

public sealed class RegistroPacienteTestFactory
    : WebApplicationFactory<Program>
{

    
public CorreoElectronicoPruebaService CorreoDePrueba { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {

            services.RemoveAll<ICorreoElectronicoService>();

services.AddSingleton<ICorreoElectronicoService>(
    CorreoDePrueba);

            // Eliminar la configuración original de SQL Server
            services.RemoveAll<
                IDbContextOptionsConfiguration<VitaliaDbContext>>();

            services.RemoveAll<
                DbContextOptions<VitaliaDbContext>>();

            // Crear una conexión SQLite exclusivamente para las pruebas
            services.AddSingleton<DbConnection>(_ =>
            {
                var conexion = new SqliteConnection(
                    "Data Source=:memory:");

                conexion.Open();
                return conexion;
            });

            // Registrar nuevamente el DbContext utilizando SQLite
            services.AddDbContext<VitaliaDbContext>(
                (proveedor, opciones) =>
                {
                    var conexion = proveedor
                        .GetRequiredService<DbConnection>();

                    opciones.UseSqlite(conexion);
                });
        });
    }
}
