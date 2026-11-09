
using System.Collections.Concurrent;
using Vitalia.Api.Services.Interfaces;

namespace Vitalia.Api.Tests.Integration;

public sealed class CorreoElectronicoPruebaService
    : ICorreoElectronicoService
{
    public ConcurrentQueue<(string CorreoDestino, string EnlaceConfirmacion)>
        Envios { get; } = new();

    public Task EnviarConfirmacionAsync(
        string correoDestino,
        string enlaceConfirmacion,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        Envios.Enqueue((
            correoDestino,
            enlaceConfirmacion
        ));

        return Task.CompletedTask;
    }
}
