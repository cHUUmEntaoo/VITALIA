
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Vitalia.Api.Services.Interfaces;

namespace Vitalia.Api.Services;

public class EspecialidadSqlService : IEspecialidadService
{
    private readonly VitaliaDbContext _context;

    public EspecialidadSqlService(VitaliaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Especialidad>> ObtenerEspecialidadesAsync(
        bool incluirInactivas = false)
    {
        IQueryable<Especialidad> consulta =
            _context.Especialidades.AsNoTracking();

        if (!incluirInactivas)
        {
            consulta = consulta.Where(e => e.Activa);
        }

        return await consulta
            .OrderBy(e => e.Nombre)
            .ToListAsync();
    }

    public async Task<Especialidad?> ObtenerEspecialidadPorIdAsync(
        int id)
    {
        return await _context.Especialidades
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id);
    }
}
