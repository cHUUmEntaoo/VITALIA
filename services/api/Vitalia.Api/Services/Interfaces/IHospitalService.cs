using Vitalia.Api.Models;

namespace Vitalia.Api.Services.Interfaces;

public interface IHospitalService
{
    List<Hospital> ObtenerHospitales();

    public Hospital? ObtenerHospitalPorId(int id)
    {
        var hospitales = ObtenerHospitales();
        return hospitales.FirstOrDefault(h => h.Id == id);
        
    }
}
