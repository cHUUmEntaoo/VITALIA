using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.Models;
using Vitalia.Api.Services.Interfaces;

namespace Vitalia.Api.Services;

public class HospitalSqlService : IHospitalService
{
    private readonly VitaliaDbContext _context;

    public HospitalSqlService(VitaliaDbContext context)
    {
        _context = context;
        
    }

    public List<Hospital> ObtenerHospitales()
    {
        return _context.Hospitales
        .AsNoTracking()
        .OrderBy(h => h.Id)
        .ToList();
    }
    
    public Hospital? ObtenerHospitalPorId(int id)
    {
        return _context.Hospitales
        .AsNoTracking()
        .FirstOrDefault(h => h.Id == id);
    }

}