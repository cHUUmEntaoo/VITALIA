namespace Vitalia.Api.Models;

public class HorarioMedico
{
    public int Id { get; set; }
    public int MedicoId { get; set; }
    public Medico Medico { get; set; } = null!;
    public int HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;
    public int DiaSemana { get; set; }  // 0=domingo, 1=lunes ... 6=sábado
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    public int IntervaloMinutos { get; set; } = 30;
    public bool Activo { get; set; } = true;
}
