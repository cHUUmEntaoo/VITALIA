using System.Globalization;
using Microsoft.Extensions.Configuration;

namespace Vitalia.Api.Services;

// Calendario de DEMOSTRACIÓN; los feriados provienen de las listas oficiales 2026/2027.
// Si un año no está validado, se bloquean reservas para evitar fechas no verificadas.
// Las ausencias se configuran por MedicoId en vitalia-agenda.json.
public static class AgendaCalendario
{
    private static bool FechaIso(string? valor, out DateOnly fecha) =>
        DateOnly.TryParseExact(valor, "yyyy-MM-dd", CultureInfo.InvariantCulture,
            DateTimeStyles.None, out fecha);

    public static string? MotivoCierre(DateOnly fecha, int medicoId)
    {
        var ruta = Path.Combine(AppContext.BaseDirectory, "vitalia-agenda.json");
        if (!File.Exists(ruta))
            return "Calendario no configurado. No se aceptan reservas.";
        var configuracion = new ConfigurationBuilder().AddJsonFile(ruta, optional: false).Build();
        if (fecha.DayOfWeek == DayOfWeek.Sunday)
            return "No se programan citas los domingos.";

        var raiz = configuracion.GetSection("VitaliaAgenda");
        var anios = raiz.GetSection("AniosHabilitados").GetChildren()
            .Select(x => int.TryParse(x.Value, out int y) ? y : -1).ToHashSet();
        if (!anios.Contains(fecha.Year))
            return "El calendario de feriados de ese año todavía no ha sido validado.";

        foreach (var feriado in raiz.GetSection("Feriados").GetChildren())
        {
            if (FechaIso(feriado["Fecha"], out var dia) && dia == fecha)
                return $"No se programan citas en feriados: {feriado["Motivo"] ?? "feriado nacional"}.";
        }

        foreach (var ausencia in raiz.GetSection("Ausencias").GetChildren())
        {
            if (!int.TryParse(ausencia["MedicoId"], out var id) || id != medicoId) continue;
            if (!FechaIso(ausencia["Desde"], out var inicio) ||
                !FechaIso(ausencia["Hasta"], out var fin)) continue;
            if (inicio <= fecha && fecha <= fin)
                return $"Profesional no disponible: {ausencia["Motivo"] ?? "ausencia programada"}.";
        }
        return null;
    }
}
