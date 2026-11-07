using Microsoft.AspNetCore.Mvc;
using Vitalia.Api.Services.Interfaces;
using Vitalia.Api.DTOs;

namespace Vitalia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class HospitalesController : ControllerBase
{
    private readonly IHospitalService _hospitalService;

    public HospitalesController(IHospitalService hospitalService)
    {
        _hospitalService = hospitalService;
    }

    [HttpGet]
    public ActionResult<List<HospitalResponseDto>> ObtenerHospitales()
    {
        var hospitales = _hospitalService.ObtenerHospitales();

        var hospitalDtos = hospitales.Select(h => new HospitalResponseDto
        {
            Id = h.Id,
            Nombre = h.Nombre,
            Ciudad = h.Ciudad
        }).ToList();

        return Ok(hospitalDtos);
    }

    [HttpGet("{id:int}")]
    public ActionResult<HospitalResponseDto> ObternerHospitalPorId(int id)
    {
        if (id <= 0)
        {
            return BadRequest("El identificador debe ser mayor que cero.");
        }

        var hospital = _hospitalService.ObtenerHospitalPorId(id);

        if (hospital is null)
        {
            return NotFound("El hospital solicitado no existe.");
        }

        var respuesta = new HospitalResponseDto
        {
            Id = hospital.Id,
            Nombre = hospital.Nombre,
            Ciudad = hospital.Ciudad
        };

        return Ok(respuesta);
        
    }
}