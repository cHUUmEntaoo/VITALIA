
using System.ComponentModel.DataAnnotations;

namespace Vitalia.Api.Contracts.Auth;

public sealed class ConfirmarCorreoRequest
{
    [Required]
    public string UsuarioId { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;
}
