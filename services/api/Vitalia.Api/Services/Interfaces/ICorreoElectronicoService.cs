
namespace Vitalia.Api.Services.Interfaces;

public interface ICorreoElectronicoService
{
    Task EnviarConfirmacionAsync(
        string correoDestino,
        string enlaceConfirmacion,
        CancellationToken cancellationToken = default);
}
