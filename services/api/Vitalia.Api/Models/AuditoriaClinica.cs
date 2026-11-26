namespace Vitalia.Api.Models;

// Registro de accesos sin copiar el contenido clinico.
public sealed class AuditoriaClinica
{
    public long Id { get; set; }
    public string UsuarioId { get; set; } = "";
    public int CitaId { get; set; }
    public string Accion { get; set; } = "";
    public DateTime FechaUtc { get; set; } = DateTime.UtcNow;
}
