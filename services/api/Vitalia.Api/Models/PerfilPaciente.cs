namespace Vitalia.Api.Models;

public class PerfilPaciente
{
    public string PacienteId { get; set; } = string.Empty;
    public Usuario Paciente { get; set; } = null!;
    public bool TieneSeguro { get; set; }
    public string? Aseguradora { get; set; }
    public string? NumeroAfiliacion { get; set; }
}
