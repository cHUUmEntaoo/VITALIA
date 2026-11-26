
namespace Vitalia.Api.Models;

public class MedicoHospital
{
    public int MedicoId { get; set; }

    public Medico Medico { get; set; } = null!;

    public int HospitalId { get; set; }

    public Hospital Hospital { get; set; } = null!;
}
