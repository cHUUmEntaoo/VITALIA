
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Vitalia.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpGet("me")]
    [Authorize]
    public IActionResult ObtenerUsuarioActual()
    {
        var resultado = new
        {
            Id = User.FindFirstValue(ClaimTypes.NameIdentifier),
            NombreUsuario = User.Identity?.Name,
            Roles = User.FindAll(ClaimTypes.Role)
                .Select(claim => claim.Value)
                .ToList()
        };

        return Ok(resultado);
    }
}
