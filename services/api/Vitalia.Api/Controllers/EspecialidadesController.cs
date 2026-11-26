
using Microsoft.AspNetCore.Mvc;
using Vitalia.Api.DTOs;
using Vitalia.Api.Services.Interfaces;

namespace Vitalia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EspecialidadesController : ControllerBase
{
    private readonly IEspecialidadService _especialidadService;

    public EspecialidadesController(
        IEspecialidadService especialidadService)
    {
        _especialidadService = especialidadService;
    }

    // GET: api/especialidades
    [HttpGet]
    public async Task<ActionResult<List<EspecialidadResponseDto>>>
        ObtenerEspecialidades()
    {
        var especialidades = await _especialidadService
            .ObtenerEspecialidadesAsync();

        var respuesta = especialidades.Select(e =>
            new EspecialidadResponseDto
            {
                Id = e.Id,
                Nombre = e.Nombre,
                Descripcion = e.Descripcion,
                Activa = e.Activa
            }).ToList();

        return Ok(respuesta);
    }

    // GET: api/especialidades/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EspecialidadResponseDto>>
        ObtenerEspecialidadPorId(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                mensaje = "El identificador debe ser mayor que cero."
            });
        }

        var especialidad = await _especialidadService
            .ObtenerEspecialidadPorIdAsync(id);

        // El catálogo público solo muestra especialidades activas.
        if (especialidad is null || !especialidad.Activa)
        {
            return NotFound(new
            {
                mensaje = "Especialidad no encontrada."
            });
        }

        var respuesta = new EspecialidadResponseDto
        {
            Id = especialidad.Id,
            Nombre = especialidad.Nombre,
            Descripcion = especialidad.Descripcion,
            Activa = especialidad.Activa
        };

        return Ok(respuesta);
    }
}
