
using Vitalia.Api.Services;
using Xunit;

namespace Vitalia.Api.Tests.Services;

public class HospitalServiceTests
{
    [Fact]
    public void ObtenerHospitales_DebeDevolverTresHospitales()
    {
        // Arrange: preparar el servicio
        var hospitalService = new HospitalService();

        // Act: ejecutar el método
        var hospitales = hospitalService.ObtenerHospitales();

        // Assert: comprobar el resultado
        Assert.Equal(3, hospitales.Count);
    }

    [Fact]
    public void ObtenerHospitalPorId_DebeDevolverHospitalExistente()
    {
    // Arrange
    var hospitalService = new HospitalService();

    // Act
    var hospital = hospitalService.ObtenerHospitalPorId(2);

    // Assert
    Assert.NotNull(hospital);
    Assert.Equal(2, hospital.Id);
    Assert.Equal("Bávaro", hospital.Ciudad);
    }

    [Fact]
    public void ObtenerHospitalPorId_DebeDevolverNullSiNoExiste()
    {
        // Arrange
        var hospitalService = new HospitalService();

        // Act
        var hospital = hospitalService.ObtenerHospitalPorId(999);

        // Assert
        Assert.Null(hospital);
    }
}
