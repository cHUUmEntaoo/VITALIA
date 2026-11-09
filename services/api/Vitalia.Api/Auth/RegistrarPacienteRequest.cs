
using System.ComponentModel.DataAnnotations;

namespace Vitalia.Api.Contracts.Auth;

public sealed class RegistrarPacienteRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Nombre { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Apellido { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string CorreoElectronico { get; init; } = string.Empty;

    [Required]
    [MinLength(12)]
    public string Contrasena { get; init; } = string.Empty;
}
