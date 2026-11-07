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
}