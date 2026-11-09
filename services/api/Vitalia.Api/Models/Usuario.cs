
using Microsoft.AspNetCore.Identity;

namespace Vitalia.Api.Models;

public class Usuario : IdentityUser
{
    public string Nombre { get; set; } = string.Empty;

    public string Apellido { get; set; } = string.Empty;

    public DateTime FechaRegistroUtc { get; set; } = DateTime.UtcNow;
}
