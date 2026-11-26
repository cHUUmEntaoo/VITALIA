namespace Vitalia.Api.Models;

public class Cita
{
    public int Id { get; set; }
    public string PacienteId { get; set; } = string.Empty;
    public Usuario Paciente { get; set; } = null!;
    public int MedicoId { get; set; }
    public Medico Medico { get; set; } = null!;
    public int HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;
    public int EspecialidadId { get; set; }
    public Especialidad Especialidad { get; set; } = null!;
    public DateOnly Fecha { get; set; }
    public TimeOnly Hora { get; set; }
    public string Estado { get; set; } = "Programada";
    public DateTime CreadaUtc { get; set; } = DateTime.UtcNow;
}
