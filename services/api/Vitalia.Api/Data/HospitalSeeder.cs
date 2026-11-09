using Vitalia.Api.Models;
using Vitalia.Api.Data;

public static class HospitalSeeder
{
    public static void Seed(VitaliaDbContext context)
    {
        var hospitalesIniciales = new[]
        {
            new Hospital
            {
                Nombre = "Centro VITALIA Santo Domingo",
                Ciudad = "Santo Domingo"
            },

            new Hospital
            {
                Nombre = "Centro VITALIA Bávaro",
                Ciudad = "Bávaro"
            },

            new Hospital
            {
                Nombre = "Centro VITALIA Santiago",
                Ciudad = "Santiago"
            }
        };

                bool hayCambios = false;
                foreach (var hospital in hospitalesIniciales)
                {
                    bool existe = context.Hospitales.Any(
                    h => h.Nombre == hospital.Nombre
                );

                if (!existe)
                {
                    context.Hospitales.Add(hospital);
                    hayCambios = true;
                }

                if (hayCambios)
            {
                context.SaveChanges();
            }
        }
    }

}