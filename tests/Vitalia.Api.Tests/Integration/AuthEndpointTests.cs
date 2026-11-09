using System.Text.Json;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Vitalia.Api.Services;
using Vitalia.Api.Services.Interfaces;
using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Authentication;
using System.Net.Http.Headers;
using Xunit;

namespace Vitalia.Api.Tests.Integration;

public class AuthEndpointTests
{
    [Fact]
    public async Task ObtenerUsuarioActual_SinToken_DebeResponder401()
    {
        // Arrange: iniciar la API en un entorno aislado
        using var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
            });

        using var cliente = factory.CreateClient();

        // Act: solicitar un recurso protegido sin token
        var respuesta = await cliente.GetAsync("/api/auth/me");

        // Assert: comprobar que se rechaza el acceso
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            respuesta.StatusCode
        );
    }

    
[Fact]
public async Task ObtenerHospitales_SinToken_DebeResponder200()
{
    // Arrange: iniciar la API en entorno de pruebas
    using var factory = new WebApplicationFactory<Program>()
        .WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            // Sustituir SQL Server por el servicio en memoria
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IHospitalService>();

                services.AddScoped<
                    IHospitalService,
                    HospitalService>();
            });
        });

    using var cliente = factory.CreateClient(
    new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost")
    });

    // Act: consultar hospitales sin autenticación
    using var respuesta = await cliente.GetAsync(
        "/api/hospitales");

    // Assert: el endpoint público debe responder 200
    Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

    // Verificar el contenido de la respuesta
    using var documento = JsonDocument.Parse(
        await respuesta.Content.ReadAsStringAsync());

    Assert.Equal(3, documento.RootElement.GetArrayLength());

    Assert.Equal(
        "Centro VITALIA Santo Domingo",
        documento.RootElement[0]
            .GetProperty("nombre")
            .GetString());
}


[Fact]
public async Task ObtenerUsuarioActual_ConTokenInvalido_DebeResponder401()
{
    // Arrange: iniciar la API en entorno de pruebas
    using var factory = new WebApplicationFactory<Program>()
        .WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
        });

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    // Simular un token Bearer inválido
    cliente.DefaultRequestHeaders.Authorization =
        new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Bearer",
            "token-invalido"
        );

    // Act: intentar acceder al endpoint protegido
    using var respuesta = await cliente.GetAsync(
        "/api/auth/me");

    // Assert: el servidor debe rechazar el token
    Assert.Equal(
        HttpStatusCode.Unauthorized,
        respuesta.StatusCode
    );
}


[Fact]
public async Task ObtenerUsuarioActual_ConUsuarioAutenticado_DebeResponder200()
{
    // Arrange: configurar autenticación simulada
    using var factory = new WebApplicationFactory<Program>()
        .WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureTestServices(services =>
            {
                services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = "Test";
                    options.DefaultChallengeScheme = "Test";
                })
                .AddScheme<
                    AuthenticationSchemeOptions,
                    TestAuthHandler>("Test", _ => { });
            });
        });

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    cliente.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Test");

    // Act: consultar el usuario autenticado
    using var respuesta = await cliente.GetAsync("/api/auth/me");

    // Assert: verificar acceso permitido y datos correctos
    Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

    using var documento = JsonDocument.Parse(
        await respuesta.Content.ReadAsStringAsync());

    var resultado = documento.RootElement;

    Assert.Equal(
        "usuario-prueba-001",
        resultado.GetProperty("id").GetString());

    Assert.Equal(
        "paciente.prueba",
        resultado.GetProperty("nombreUsuario").GetString());

    Assert.Equal(
        "Paciente",
        resultado.GetProperty("roles")[0].GetString());
}



}
