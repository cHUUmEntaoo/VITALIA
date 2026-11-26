namespace Vitalia.Api.Models;

// DEMOSTRACION ACADEMICA: no introducir informacion clinica real.
// Solo el medico vinculado a la cita puede modificar esta nota.
public sealed class NotaClinica
{
    public int Id { get; set; }
    public int CitaId { get; set; }
    public Cita Cita { get; set; } = null!;
    public int MedicoId { get; set; }
    public string PacienteId { get; set; } = "";
    public string MotivoConsulta { get; set; } = "";
    public string Antecedentes { get; set; } = "";
    public string Hallazgos { get; set; } = "";
    public string Diagnostico { get; set; } = "";
    public string Plan { get; set; } = "";
    public string Indicaciones { get; set; } = "";
    public DateTime CreadaUtc { get; set; } = DateTime.UtcNow;
    public DateTime ActualizadaUtc { get; set; } = DateTime.UtcNow;
    public DateTime? FirmadaUtc { get; set; }
}
