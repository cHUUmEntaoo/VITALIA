
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Vitalia.Api.Contracts.Auth;
using Vitalia.Api.Data;
using Vitalia.Api.Models;

namespace Vitalia.Api.Controllers;

[ApiController]
[Route("api/auth")]

public class AuthController : ControllerBase {
    // 1. Dependencias
    private readonly UserManager<Usuario> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly VitaliaDbContext _db;

    private readonly SignInManager<Usuario> _signInManager;

    // 2. Constructor

public AuthController(
    UserManager<Usuario> userManager,
    RoleManager<IdentityRole> roleManager,
    VitaliaDbContext db,
    SignInManager<Usuario> signInManager)
{
    _userManager = userManager;
    _roleManager = roleManager;
    _db = db;
    _signInManager = signInManager;
}


    // 3. Endpoint protegido
    [HttpGet("me")]
    [Authorize]
    public IActionResult ObtenerUsuarioActual()
    {
        var resultado = new
        {
            Id = User.FindFirstValue(ClaimTypes.NameIdentifier),
            NombreUsuario = User.Identity?.Name,
            Roles = User.FindAll(ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList()
        };

        return Ok(resultado);
    }

    [HttpPost("registro-paciente")]
[AllowAnonymous]
public async Task<IActionResult> RegistrarPaciente(
    [FromBody] RegistrarPacienteRequest solicitud)
{
    const string rolPaciente = "Paciente";

    // Verificar que el rol exista.
    if (!await _roleManager.RoleExistsAsync(rolPaciente))
    {
        return StatusCode(503, new
        {
            mensaje = "El registro no está disponible temporalmente."
        });
    }

    // Normalizar los datos recibidos.
    var correo = solicitud.CorreoElectronico.Trim();

    var usuario = new Usuario
    {
        UserName = correo,
        Email = correo,
        Nombre = solicitud.Nombre.Trim(),
        Apellido = solicitud.Apellido.Trim(),
        FechaRegistroUtc = DateTime.UtcNow
    };

    // El usuario y su rol deben guardarse juntos.
    await using var transaccion =
        await _db.Database.BeginTransactionAsync();

    var resultado = await _userManager.CreateAsync(
        usuario,
        solicitud.Contrasena);

    if (!resultado.Succeeded)
    {
        return BadRequest(new
        {
            mensaje = "No fue posible completar el registro. Verifica los datos."
        });
    }

    // El rol se asigna desde el servidor.
    var asignacion = await _userManager.AddToRoleAsync(
        usuario,
        rolPaciente);

    if (!asignacion.Succeeded)
    {
        return StatusCode(500, new
        {
            mensaje = "No fue posible completar el registro."
        });
    }

    await transaccion.CommitAsync();

    return StatusCode(201, new
    {
        mensaje = "Paciente registrado correctamente.",
        id = usuario.Id,
        rol = rolPaciente
    });
}


[HttpPost("login")]
[AllowAnonymous]
public async Task<IActionResult> IniciarSesion(
    [FromBody] IniciarSesionRequest solicitud)
{
    // Buscar el usuario por correo.
    var correo = solicitud.CorreoElectronico.Trim();

    var usuario = await _userManager.FindByEmailAsync(correo);

    if (usuario is null)
    {
        return Unauthorized(new
        {
            mensaje = "Credenciales inválidas."
        });
    }

    // Indicar que el inicio de sesión utilizará tokens Bearer.
    _signInManager.AuthenticationScheme =
        IdentityConstants.BearerScheme;

    // Validar contraseña y contabilizar intentos fallidos.
    var resultado = await _signInManager.PasswordSignInAsync(
        usuario,
        solicitud.Contrasena,
        isPersistent: false,
        lockoutOnFailure: true);

    if (!resultado.Succeeded)
    {
        return Unauthorized(new
        {
            mensaje = "No fue posible iniciar sesión."
        });
    }

    // Identity ya escribió la respuesta con el token Bearer.
    return new EmptyResult();
}


[HttpPost("confirmar-correo")]
[AllowAnonymous]
public async Task<IActionResult> ConfirmarCorreo(
    [FromBody] ConfirmarCorreoRequest solicitud)
{
    var usuario = await _userManager.FindByIdAsync(
        solicitud.UsuarioId);

    if (usuario is null)
    {
        return BadRequest(new
        {
            mensaje = "Solicitud de confirmacion invalida."
        });
    }

    var resultado = await _userManager.ConfirmEmailAsync(
        usuario,
        solicitud.Token);

    if (!resultado.Succeeded)
    {
        return BadRequest(new
        {
            mensaje = "Solicitud de confirmacion invalida."
        });
    }

    return Ok(new
    {
        mensaje = "Correo confirmado correctamente."
    });
}



}
