
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Models;

namespace Vitalia.Api.Data;

public static class EspecialidadSeeder
{
    public static async Task SeedAsync(
        VitaliaDbContext context)
    {
        var especialidades = new[]
        {
            new
            {
                Nombre = "Cardiología",
                Descripcion = "Diagnóstico y tratamiento de enfermedades del corazón."
            },
            new
            {
                Nombre = "Dermatología",
                Descripcion = "Atención médica de la piel, cabello y uñas."
            },
            new
            {
                Nombre = "Medicina interna",
                Descripcion = "Diagnóstico y tratamiento integral de adultos."
            },
            new
            {
                Nombre = "Pediatría",
                Descripcion = "Atención médica de niños y adolescentes."
            },
            new
            {
                Nombre = "Neurología",
                Descripcion = "Diagnóstico y tratamiento del sistema nervioso."
            }
        };

        foreach (var especialidad in especialidades)
        {
            var existe = await context.Especialidades
                .AnyAsync(e => e.Nombre == especialidad.Nombre);

            if (existe)
            {
                continue;
            }

            context.Especialidades.Add(new Especialidad
            {
                Nombre = especialidad.Nombre,
                Descripcion = especialidad.Descripcion,
                Activa = true
            });
        }

        await context.SaveChangesAsync();
    }
}
