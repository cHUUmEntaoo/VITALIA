
using Microsoft.AspNetCore.Mvc;
using Vitalia.Api.Controllers;
using Vitalia.Api.DTOs;
using Vitalia.Api.Models;
using Vitalia.Api.Services.Interfaces;
using Xunit;

namespace Vitalia.Api.Tests.Controllers;

public class HospitalesControllerTests
{
    [Fact]
    public void ObtenerHospitales_DebeResponderOk()
    {
        // Arrange
        IHospitalService servicioFalso = new HospitalServiceFalso();

        var controller = new HospitalesController(servicioFalso);

        // Act
        var resultado = controller.ObtenerHospitales();

        // Assert
        var resultadoOk = Assert.IsType<OkObjectResult>(
            resultado.Result
        );

        var hospitales = Assert.IsType<List<HospitalResponseDto>>(
            resultadoOk.Value
        );

        Assert.Single(hospitales);
        Assert.Equal(2, hospitales[0].Id);
        Assert.Equal("Centro VITALIA Bávaro", hospitales[0].Nombre);
        Assert.Equal("Bávaro", hospitales[0].Ciudad);
    }

    private sealed class HospitalServiceFalso : IHospitalService
    {
        public List<Hospital> ObtenerHospitales()
        {
            return new List<Hospital>
            {
                new Hospital
                {
                    Id = 2,
                    Nombre = "Centro VITALIA Bávaro",
                    Ciudad = "Bávaro"
                }
            };
        }

        public Hospital? ObtenerHospitalPorId(int id)
        {
            return ObtenerHospitales()
                .FirstOrDefault(h => h.Id == id);
        }
    }

    [Fact]
    public void ObtenerHospitalPorId_DebeResponder400SiIdEsInvalido()
    {
        IHospitalService servicioFalso = new HospitalServiceFalso();
        var controller = new HospitalesController(servicioFalso);

        var resultado = controller.ObtenerHospitalPorId(0);

        var respuesta = Assert.IsType<ObjectResult>(resultado.Result);
        Assert.Equal(400, respuesta.StatusCode);

        var problemDetails = Assert.IsType<ProblemDetails>(respuesta.Value);
        Assert.Equal(400, problemDetails.Status);
    }

    [Fact]
    public void ObtenerHospitalPorId_DebeResponder404SiNoExiste()
    {
        // Arrange
        IHospitalService servicioFalso = new HospitalServiceFalso();
        var controller = new HospitalesController(servicioFalso);

     // Act
        var resultado = controller.ObtenerHospitalPorId(999);

        // Assert
        var respuesta = Assert.IsType<ObjectResult>(resultado.Result);
        Assert.Equal(404, respuesta.StatusCode);

        var problema = Assert.IsType<ProblemDetails>(respuesta.Value);
        Assert.Equal(404, problema.Status);
    }

    [Fact]

    public void ObtenerHospitalPorId_DebeResponder200SiExiste()
    {
        // Arrange
        IHospitalService servicioFalso = new HospitalServiceFalso();
        var controller = new HospitalesController(servicioFalso);

        // Act
        var resultado = controller.ObtenerHospitalPorId(2);

        // Assert
        var respuestaOk = Assert.IsType<OkObjectResult>(resultado.Result);
        var hospitalDto = Assert.IsType<HospitalResponseDto>(respuestaOk.Value);

        Assert.Equal(200, respuestaOk.StatusCode);
        Assert.Equal(2, hospitalDto.Id);
        Assert.Equal("Centro VITALIA Bávaro", hospitalDto.Nombre);
        Assert.Equal("Bávaro", hospitalDto.Ciudad);
    }


}

