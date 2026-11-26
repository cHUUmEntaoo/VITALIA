
namespace Vitalia.Api.DTOs;

public class EspecialidadResponseDto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public bool Activa { get; set; }
}
