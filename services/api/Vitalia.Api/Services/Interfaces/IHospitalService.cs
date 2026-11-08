using Vitalia.Api.Models;

namespace Vitalia.Api.Services.Interfaces;

public interface IHospitalService
{
    List<Hospital> ObtenerHospitales();

    Hospital? ObtenerHospitalPorId(int id);
}

