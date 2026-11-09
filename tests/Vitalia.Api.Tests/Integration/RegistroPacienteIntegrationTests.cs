
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Xunit;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Vitalia.Api.Tests.Integration;

public class RegistroPacienteIntegrationTests
{
    [Fact]
    public async Task RegistrarPaciente_ConDatosValidos_CreaUsuarioConRolPacienteYHash()
    {
        // Arrange: iniciar una API con SQLite en memoria
        using var factory = new RegistroPacienteTestFactory();

        using var cliente = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });

        // Crear el esquema y el rol en la base de pruebas
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider
                .GetRequiredService<VitaliaDbContext>();

            await db.Database.EnsureCreatedAsync();

            var roleManager = scope.ServiceProvider
                .GetRequiredService<RoleManager<IdentityRole>>();

            var resultadoRol = await roleManager.CreateAsync(
                new IdentityRole("Paciente"));

            Assert.True(resultadoRol.Succeeded);
        }

        const string correo = "paciente.prueba@vitalia.test";
        const string contrasena = "Vitalia#2026Segura";

        var solicitud = new
        {
            nombre = "Paciente",
            apellido = "Prueba",
            correoElectronico = correo,
            contrasena
        };

        // Act: registrar el paciente mediante HTTP
        using var respuesta = await cliente.PostAsJsonAsync(
            "/api/auth/registro-paciente",
            solicitud);

        var contenido = await respuesta.Content.ReadAsStringAsync();

        Assert.True(
            respuesta.StatusCode == HttpStatusCode.Created,
            $"Se esperaba HTTP 201. Respuesta: {contenido}");

        // Assert: consultar los datos almacenados
        using var verificacion = factory.Services.CreateScope();

        var usuarios = verificacion.ServiceProvider
            .GetRequiredService<UserManager<Usuario>>();

        var usuario = await usuarios.FindByEmailAsync(correo);

        Assert.NotNull(usuario);

        // La contraseña no debe almacenarse en texto plano
        Assert.NotNull(usuario.PasswordHash);
        Assert.NotEqual(contrasena, usuario.PasswordHash);

        // El hash debe corresponder a la contraseña original
        Assert.True(
            await usuarios.CheckPasswordAsync(usuario, contrasena));

        // Debe tener exactamente un rol: Paciente
        var roles = await usuarios.GetRolesAsync(usuario);

        Assert.Equal("Paciente", Assert.Single(roles));
    }


[Fact]
public async Task RegistrarPaciente_ConCorreoDuplicado_DebeResponder400()
{
    // Arrange: preparar una base SQLite independiente
    using var factory = new RegistroPacienteTestFactory();

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider
            .GetRequiredService<VitaliaDbContext>();

        await db.Database.EnsureCreatedAsync();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var resultadoRol = await roleManager.CreateAsync(
            new IdentityRole("Paciente"));

        Assert.True(resultadoRol.Succeeded);
    }

    const string correo = "paciente.duplicado@vitalia.test";

    var solicitud = new
    {
        nombre = "Paciente",
        apellido = "Duplicado",
        correoElectronico = correo,
        contrasena = "Vitalia#2026Segura"
    };

    // Act: registrar al paciente por primera vez
    using var primeraRespuesta = await cliente.PostAsJsonAsync(
        "/api/auth/registro-paciente",
        solicitud);

    Assert.Equal(
        HttpStatusCode.Created,
        primeraRespuesta.StatusCode);

    // Intentar registrar otra cuenta con el mismo correo
    var solicitudDuplicada = new
    {
        nombre = "Otro",
        apellido = "Paciente",
        correoElectronico = correo.ToUpperInvariant(),
        contrasena = "Vitalia#2026Segura"
    };

    using var segundaRespuesta = await cliente.PostAsJsonAsync(
        "/api/auth/registro-paciente",
        solicitudDuplicada);

    // Assert: el correo duplicado debe rechazarse
    Assert.Equal(
        HttpStatusCode.BadRequest,
        segundaRespuesta.StatusCode);

    // Verificar que solo se almacenó una cuenta
    using var verificacion = factory.Services.CreateScope();

    var dbVerificacion = verificacion.ServiceProvider
        .GetRequiredService<VitaliaDbContext>();

    Assert.Equal(1, await dbVerificacion.Users.CountAsync());
}


[Fact]
public async Task RegistrarPaciente_ConContrasenaDebil_DebeResponder400()
{
    // Arrange: crear una base SQLite independiente
    using var factory = new RegistroPacienteTestFactory();

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider
            .GetRequiredService<VitaliaDbContext>();

        await db.Database.EnsureCreatedAsync();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var resultadoRol = await roleManager.CreateAsync(
            new IdentityRole("Paciente"));

        Assert.True(resultadoRol.Succeeded);
    }

    // Contraseña con longitud suficiente,
    // pero sin mayúsculas, números ni símbolos.
    var solicitud = new
    {
        nombre = "Paciente",
        apellido = "Prueba",
        correoElectronico = "paciente.debil@vitalia.test",
        contrasena = "abcdefghijklmnop"
    };

    // Act: intentar registrar al paciente
    using var respuesta = await cliente.PostAsJsonAsync(
        "/api/auth/registro-paciente",
        solicitud);

    // Assert: Identity debe rechazar la contraseña
    Assert.Equal(
        HttpStatusCode.BadRequest,
        respuesta.StatusCode);

    // Verificar que no se almacenó ninguna cuenta
    using var verificacion = factory.Services.CreateScope();

    var dbVerificacion = verificacion.ServiceProvider
        .GetRequiredService<VitaliaDbContext>();

    Assert.Equal(
        0,
        await dbVerificacion.Users.CountAsync());
}



[Fact]
public async Task IniciarSesion_ConCredencialesValidas_DebePermitirAccesoAutenticado()
{
    // Arrange: base de datos aislada
    using var factory = new RegistroPacienteTestFactory();

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider
            .GetRequiredService<VitaliaDbContext>();

        await db.Database.EnsureCreatedAsync();

        var roles = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var resultadoRol = await roles.CreateAsync(
            new IdentityRole("Paciente"));

        Assert.True(resultadoRol.Succeeded);
    }

    const string correo = "login.prueba@vitalia.test";
    const string contrasena = "Vitalia#2026Segura";

    // Registrar primero al paciente
    var registro = new
    {
        nombre = "Paciente",
        apellido = "Login",
        correoElectronico = correo,
        contrasena
    };

    using var respuestaRegistro = await cliente.PostAsJsonAsync(
        "/api/auth/registro-paciente",
        registro);

    Assert.Equal(
        HttpStatusCode.Created,
        respuestaRegistro.StatusCode);

    // Act: iniciar sesión
    var login = new
    {
        correoElectronico = correo,
        contrasena
    };

    using var respuestaLogin = await cliente.PostAsJsonAsync(
        "/api/auth/login",
        login);

    Assert.Equal(HttpStatusCode.OK, respuestaLogin.StatusCode);

    // Obtener el token generado por Identity
    using var contenidoLogin = JsonDocument.Parse(
        await respuestaLogin.Content.ReadAsStringAsync());

    var token = contenidoLogin.RootElement
        .GetProperty("accessToken")
        .GetString();

    Assert.False(string.IsNullOrWhiteSpace(token));

    // Consumir un endpoint protegido
    using var solicitudMe = new HttpRequestMessage(
        HttpMethod.Get,
        "/api/auth/me");

    solicitudMe.Headers.Authorization =
        new AuthenticationHeaderValue("Bearer", token);

    using var respuestaMe = await cliente.SendAsync(solicitudMe);

    // Assert: el token debe permitir identificar al paciente
    Assert.Equal(HttpStatusCode.OK, respuestaMe.StatusCode);

    using var perfil = JsonDocument.Parse(
        await respuestaMe.Content.ReadAsStringAsync());

    var rolesPaciente = perfil.RootElement
        .GetProperty("roles")
        .EnumerateArray();

    Assert.Equal(
        "Paciente",
        Assert.Single(rolesPaciente).GetString());
}


[Fact]
public async Task IniciarSesion_ConContrasenaIncorrecta_DebeResponder401()
{
    // Arrange: base de datos aislada
    using var factory = new RegistroPacienteTestFactory();

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider
            .GetRequiredService<VitaliaDbContext>();

        await db.Database.EnsureCreatedAsync();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var resultadoRol = await roleManager.CreateAsync(
            new IdentityRole("Paciente"));

        Assert.True(resultadoRol.Succeeded);
    }

    const string correo = "login.incorrecto@vitalia.test";

    // Registrar un paciente válido
    var registro = new
    {
        nombre = "Paciente",
        apellido = "Prueba",
        correoElectronico = correo,
        contrasena = "Vitalia#2026Segura"
    };

    using var respuestaRegistro = await cliente.PostAsJsonAsync(
        "/api/auth/registro-paciente",
        registro);

    Assert.Equal(
        HttpStatusCode.Created,
        respuestaRegistro.StatusCode);

    // Act: intentar iniciar sesión con otra contraseña
    var login = new
    {
        correoElectronico = correo,
        contrasena = "Contrasena#Equivocada2026"
    };

    using var respuestaLogin = await cliente.PostAsJsonAsync(
        "/api/auth/login",
        login);

    // Assert: el servidor debe rechazar el acceso
    Assert.Equal(
        HttpStatusCode.Unauthorized,
        respuestaLogin.StatusCode);

    // Verificar que Identity contabilizó el intento fallido
    using var verificacion = factory.Services.CreateScope();

    var userManager = verificacion.ServiceProvider
        .GetRequiredService<UserManager<Usuario>>();

    var usuario = await userManager.FindByEmailAsync(correo);

    Assert.NotNull(usuario);

    Assert.Equal(1, usuario.AccessFailedCount);
}


[Fact]
public async Task IniciarSesion_CincoIntentosFallidos_DebeBloquearCuenta()
{
    // Arrange: crear una base de datos SQLite aislada.
    using var factory = new RegistroPacienteTestFactory();

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider
            .GetRequiredService<VitaliaDbContext>();

        await db.Database.EnsureCreatedAsync();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var resultadoRol = await roleManager.CreateAsync(
            new IdentityRole("Paciente"));

        Assert.True(resultadoRol.Succeeded);
    }

    const string correo = "login.bloqueado@vitalia.test";
    const string contrasenaCorrecta = "Vitalia#2026Segura";

    // Registrar un paciente válido.
    var registro = new
    {
        nombre = "Paciente",
        apellido = "Bloqueado",
        correoElectronico = correo,
        contrasena = contrasenaCorrecta
    };

    using var respuestaRegistro = await cliente.PostAsJsonAsync(
        "/api/auth/registro-paciente",
        registro);

    Assert.Equal(
        HttpStatusCode.Created,
        respuestaRegistro.StatusCode);

    // Act: ejecutar cinco intentos con contraseña incorrecta.
    var loginIncorrecto = new
    {
        correoElectronico = correo,
        contrasena = "Contrasena#Incorrecta2026"
    };

    for (int intento = 1; intento <= 5; intento++)
    {
        using var respuesta = await cliente.PostAsJsonAsync(
            "/api/auth/login",
            loginIncorrecto);

        Assert.Equal(
            HttpStatusCode.Unauthorized,
            respuesta.StatusCode);
    }

    // Assert: comprobar que Identity bloqueó la cuenta.
    using (var scope = factory.Services.CreateScope())
    {
        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<Usuario>>();

        var usuario = await userManager.FindByEmailAsync(correo);

        Assert.NotNull(usuario);

        Assert.True(
            await userManager.IsLockedOutAsync(usuario));

        Assert.True(usuario.LockoutEnd.HasValue);

        Assert.True(
            usuario.LockoutEnd.Value >
            DateTimeOffset.UtcNow.AddMinutes(14));
    }

    // Incluso la contraseña correcta debe rechazarse
    // mientras la cuenta permanezca bloqueada.
    var loginCorrecto = new
    {
        correoElectronico = correo,
        contrasena = contrasenaCorrecta
    };

    using var respuestaBloqueada = await cliente.PostAsJsonAsync(
        "/api/auth/login",
        loginCorrecto);

    Assert.Equal(
        HttpStatusCode.Unauthorized,
        respuestaBloqueada.StatusCode);
}


[Fact]
public async Task ConfirmacionCorreo_ConTokenValido_DebeConfirmarEmail()
{
    using var factory = new RegistroPacienteTestFactory();
    using var scope = factory.Services.CreateScope();

    var db = scope.ServiceProvider
        .GetRequiredService<VitaliaDbContext>();

    await db.Database.EnsureCreatedAsync();

    var userManager = scope.ServiceProvider
        .GetRequiredService<UserManager<Usuario>>();

    var usuario = new Usuario
    {
        UserName = "confirmacion@vitalia.test",
        Email = "confirmacion@vitalia.test",
        Nombre = "Paciente",
        Apellido = "Confirmacion",
        FechaRegistroUtc = DateTime.UtcNow
    };

    var resultadoRegistro = await userManager.CreateAsync(
        usuario,
        "Vitalia#2026Segura");

    Assert.True(resultadoRegistro.Succeeded);

    // El correo comienza sin confirmar.
    Assert.False(
        await userManager.IsEmailConfirmedAsync(usuario));

    // Generar el token de confirmacion.
    var token = await userManager
        .GenerateEmailConfirmationTokenAsync(usuario);

    Assert.False(string.IsNullOrWhiteSpace(token));

    // Confirmar el correo mediante Identity.
    var resultadoConfirmacion = await userManager
        .ConfirmEmailAsync(usuario, token);

    Assert.True(resultadoConfirmacion.Succeeded);

    // Verificar que el correo quedo confirmado.
    Assert.True(
        await userManager.IsEmailConfirmedAsync(usuario));
}


[Fact]
public async Task ConfirmacionCorreo_ConTokenInvalido_NoDebeConfirmarEmail()
{
    using var factory = new RegistroPacienteTestFactory();
    using var scope = factory.Services.CreateScope();

    var db = scope.ServiceProvider
        .GetRequiredService<VitaliaDbContext>();

    await db.Database.EnsureCreatedAsync();

    var userManager = scope.ServiceProvider
        .GetRequiredService<UserManager<Usuario>>();

    var usuario = new Usuario
    {
        UserName = "token.invalido@vitalia.test",
        Email = "token.invalido@vitalia.test",
        Nombre = "Paciente",
        Apellido = "Prueba",
        FechaRegistroUtc = DateTime.UtcNow
    };

    var resultadoRegistro = await userManager.CreateAsync(
        usuario,
        "Vitalia#2026Segura");

    Assert.True(resultadoRegistro.Succeeded);

    // Intentar confirmar con un token incorrecto.
    var resultadoConfirmacion = await userManager.ConfirmEmailAsync(
        usuario,
        "token-invalido");

    // Identity debe rechazar la confirmacion.
    Assert.False(resultadoConfirmacion.Succeeded);

    // El correo debe continuar sin confirmar.
    Assert.False(
        await userManager.IsEmailConfirmedAsync(usuario));
}


[Fact]
public async Task ConfirmarCorreo_ConTokenValido_DebeResponder200()
{
    using var factory = new RegistroPacienteTestFactory();

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    string usuarioId;
    string token;

    // Preparar el usuario y generar el token.
    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider
            .GetRequiredService<VitaliaDbContext>();

        await db.Database.EnsureCreatedAsync();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<Usuario>>();

        var usuario = new Usuario
        {
            UserName = "confirmacion.http@vitalia.test",
            Email = "confirmacion.http@vitalia.test",
            Nombre = "Paciente",
            Apellido = "Confirmacion",
            FechaRegistroUtc = DateTime.UtcNow
        };

        var resultadoRegistro = await userManager.CreateAsync(
            usuario,
            "Vitalia#2026Segura");

        Assert.True(resultadoRegistro.Succeeded);

        Assert.False(
            await userManager.IsEmailConfirmedAsync(usuario));

        usuarioId = usuario.Id;

        token = await userManager
            .GenerateEmailConfirmationTokenAsync(usuario);
    }

    // Enviar el token al endpoint HTTP.
    var solicitud = new
    {
        usuarioId,
        token
    };

    using var respuesta = await cliente.PostAsJsonAsync(
        "/api/auth/confirmar-correo",
        solicitud);

    Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

    // Verificar el cambio persistido en la base de datos.
    using (var scope = factory.Services.CreateScope())
    {
        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<Usuario>>();

        var usuario = await userManager.FindByIdAsync(usuarioId);

        Assert.NotNull(usuario);

        Assert.True(
            await userManager.IsEmailConfirmedAsync(usuario));
    }
}



[Fact]
public async Task ConfirmarCorreo_ConTokenInvalido_DebeResponder400()
{
    using var factory = new RegistroPacienteTestFactory();

    using var cliente = factory.CreateClient(
        new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

    string usuarioId;

    using (var scope = factory.Services.CreateScope())
    {
        var db = scope.ServiceProvider
            .GetRequiredService<VitaliaDbContext>();

        await db.Database.EnsureCreatedAsync();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<Usuario>>();

        var usuario = new Usuario
        {
            UserName = "invalido.http@vitalia.test",
            Email = "invalido.http@vitalia.test",
            Nombre = "Paciente",
            Apellido = "Prueba",
            FechaRegistroUtc = DateTime.UtcNow
        };

        var resultado = await userManager.CreateAsync(
            usuario,
            "Vitalia#2026Segura");

        Assert.True(resultado.Succeeded);

        usuarioId = usuario.Id;
    }

    // Intentar confirmar mediante HTTP con un token falso.
    using var respuesta = await cliente.PostAsJsonAsync(
        "/api/auth/confirmar-correo",
        new
        {
            usuarioId,
            token = "token-invalido"
        });

    Assert.Equal(
        HttpStatusCode.BadRequest,
        respuesta.StatusCode);

    // Comprobar que la cuenta sigue sin confirmar.
    using (var scope = factory.Services.CreateScope())
    {
        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<Usuario>>();

        var usuario = await userManager.FindByIdAsync(
            usuarioId);

        Assert.NotNull(usuario);

        Assert.False(
            await userManager.IsEmailConfirmedAsync(usuario));
    }
}





}
