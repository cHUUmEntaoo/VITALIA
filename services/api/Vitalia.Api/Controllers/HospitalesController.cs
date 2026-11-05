
using Microsoft.AspNetCore.Mvc;

namespace Vitalia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HospitalesController : ControllerBase
{
    [HttpGet]
    public IActionResult ObtenerHospitales()
    {
        var hospitales = new[]
        {
            new
            {
                Id = 1,
                Nombre = "Centro VITALIA Santo Domingo",
                Ciudad = "Santo Domingo"
            },
            new
            {
                Id = 2,
                Nombre = "Centro VITALIA Bávaro",
                Ciudad = "Bávaro"
            },
            new
            {
                Id = 3,
                Nombre = "Centro VITALIA Santiago",
                Ciudad = "Santiago"
            }
        };

        return Ok(hospitales);
    }
}
