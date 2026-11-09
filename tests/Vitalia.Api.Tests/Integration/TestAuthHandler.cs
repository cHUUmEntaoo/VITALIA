
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Vitalia.Api.Tests.Integration;

public sealed class TestAuthHandler
    : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Identidad ficticia, exclusivamente para pruebas
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "usuario-prueba-001"),
            new Claim(ClaimTypes.Name, "paciente.prueba"),
            new Claim(ClaimTypes.Role, "Paciente")
        };

        var identidad = new ClaimsIdentity(claims, Scheme.Name);
        var usuario = new ClaimsPrincipal(identidad);

        var ticket = new AuthenticationTicket(
            usuario,
            Scheme.Name);

        return Task.FromResult(
            AuthenticateResult.Success(ticket));
    }
}
