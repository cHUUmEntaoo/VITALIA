using Vitalia.Api.Models;   

namespace Vitalia.Api.Services;

public class HospitalService
{
    public List<Hospital> ObtenerHospitales()
    {
        var hospitales = new List<Hospital>
        {
            new Hospital
            {
                Id = 1,
                Nombre = "Centro VITALIA Santo Domingo",
                Ciudad = "Santo Domingo"
            },
            new Hospital
            {
                Id = 2,
                Nombre = "Centro VITALIA Bávaro",
                Ciudad = "Bávaro"
            },
            new Hospital
            {
                Id = 3,
                Nombre = "Centro VITALIA Santiago",
                Ciudad = "Santiago"
            }
        };

        return hospitales;
    }
}
