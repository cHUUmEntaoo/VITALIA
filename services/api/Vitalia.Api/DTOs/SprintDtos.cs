using System.ComponentModel.DataAnnotations;

namespace Vitalia.Api.DTOs;

public sealed class MedicoCrearDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = "";
    [Required, StringLength(100, MinimumLength = 2)]
    public string Apellido { get; set; } = "";
    [StringLength(50)] public string? NumeroExequatur { get; set; }
    [StringLength(500)] public string? FotoUrl { get; set; }
    [Required, MinLength(1)] public List<int> HospitalIds { get; set; } = [];
    [Required, MinLength(1)] public List<int> EspecialidadIds { get; set; } = [];
}

public sealed class HorarioMedicoDto
{
    [Range(1, int.MaxValue)] public int HospitalId { get; set; }
    [Range(0, 6)] public int DiaSemana { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    [Range(10, 120)] public int IntervaloMinutos { get; set; } = 30;
}

public sealed class ReemplazarHorariosDto
{
    [Required] public List<HorarioMedicoDto> Horarios { get; set; } = [];
}

public sealed class CrearCitaDto
{
    [Range(1, int.MaxValue)] public int MedicoId { get; set; }
    [Range(1, int.MaxValue)] public int HospitalId { get; set; }
    [Range(1, int.MaxValue)] public int EspecialidadId { get; set; }
    public DateOnly Fecha { get; set; }
    public TimeOnly Hora { get; set; }
}

public sealed class ReprogramarCitaDto
{
    public DateOnly Fecha { get; set; }
    public TimeOnly Hora { get; set; }
}

public sealed class CitaRespuestaDto
{
    public int Id { get; set; }
    public int MedicoId { get; set; }
    public int HospitalId { get; set; }
    public int EspecialidadId { get; set; }
    public string Medico { get; set; } = "";
    public string Hospital { get; set; } = "";
    public string Ciudad { get; set; } = "";
    public string Especialidad { get; set; } = "";
    public DateOnly Fecha { get; set; }
    public TimeOnly Hora { get; set; }
    public string Estado { get; set; } = "";
}

public sealed class ActualizarPerfilDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = "";
    [Required, StringLength(100, MinimumLength = 2)]
    public string Apellido { get; set; } = "";
    [Phone, StringLength(30)] public string? Telefono { get; set; }
    public bool TieneSeguro { get; set; }
    [StringLength(120)] public string? Aseguradora { get; set; }
    [StringLength(100)] public string? NumeroAfiliacion { get; set; }
}
