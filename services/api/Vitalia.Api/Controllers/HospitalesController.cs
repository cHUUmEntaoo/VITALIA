using Microsoft.AspNetCore.Mvc;
using Vitalia.Api.Services;

namespace Vitalia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HospitalesController : ControllerBase
{
    private readonly HospitalService _hospitalService;

    public HospitalesController(HospitalService hospitalService)
    {
        _hospitalService = hospitalService;
    }

    [HttpGet]
    public IActionResult GetHospitales()
    {
        var hospitales = _hospitalService.ObtenerHospitales();
        return Ok(hospitales);
    }
}
