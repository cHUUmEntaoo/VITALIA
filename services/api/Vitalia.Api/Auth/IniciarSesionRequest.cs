
using System.ComponentModel.DataAnnotations;

namespace Vitalia.Api.Contracts.Auth;

public sealed class IniciarSesionRequest
{
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string CorreoElectronico { get; init; } = string.Empty;

    [Required]
    public string Contrasena { get; init; } = string.Empty;
}
