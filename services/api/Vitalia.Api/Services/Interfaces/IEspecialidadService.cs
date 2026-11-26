
using Vitalia.Api.Models;

namespace Vitalia.Api.Services.Interfaces;

public interface IEspecialidadService
{
    Task<List<Especialidad>> ObtenerEspecialidadesAsync(
        bool incluirInactivas = false);

    Task<Especialidad?> ObtenerEspecialidadPorIdAsync(int id);
}
