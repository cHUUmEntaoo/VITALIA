
namespace Vitalia.Api.Models;

public class Medico
{
    public int Id { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public string Apellido { get; set; } = string.Empty;

    public string? NumeroExequatur { get; set; }

    public string? FotoUrl { get; set; }

    public bool Activo { get; set; } = true;

    // Cuenta institucional opcional.
    // Permite cargar médicos de demostración sin
    // crear todavía sus credenciales de acceso.
    public string? UsuarioId { get; set; }

    public Usuario? Usuario { get; set; }
}
