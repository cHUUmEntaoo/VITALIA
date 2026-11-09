
using Microsoft.AspNetCore.Identity;

namespace Vitalia.Api.Data;

public static class RoleSeeder
{
    public static async Task SeedAsync(
        RoleManager<IdentityRole> roleManager)
    {
        string[] roles =
        {
            "Administrador",
            "Medico",
            "Recepcionista",
            "Paciente"
        };

        foreach (var nombreRol in roles)
        {
            bool existe = await roleManager.RoleExistsAsync(nombreRol);

            if (existe)
            {
                continue;
            }

            var resultado = await roleManager.CreateAsync(
                new IdentityRole(nombreRol));

            if (!resultado.Succeeded)
            {
                var errores = string.Join(
                    "; ",
                    resultado.Errors.Select(e => e.Description));

                throw new InvalidOperationException(
                    $"No se pudo crear el rol '{nombreRol}': {errores}");
            }
        }
    }
}
