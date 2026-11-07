using Microsoft.AspNetCore.Mvc;
using Vitalia.Api.Services.Interfaces;

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
    public IActionResult ObtenerHospitales()
    {
        var hospitales = _hospitalService.ObtenerHospitales();

        return Ok(hospitales);
    }
}