
using Microsoft.AspNetCore.Identity;
using Vitalia.Api.Models;

namespace Vitalia.Api.Data;

public static class AdministradorInicialSeeder
{
    public static async Task SeedAsync(
        UserManager<Usuario> userManager,
        IConfiguration configuracion,
        IHostEnvironment entorno)
    {
        // Exclusivo para desarrollo.
        if (!entorno.IsDevelopment())
        {
            return;
        }

        // Se ejecuta solamente cuando se habilita.
        if (!configuracion.GetValue<bool>(
            "AdministradorInicial:Habilitado"))
        {
            return;
        }

        var correo = configuracion[
            "AdministradorInicial:Correo"]?.Trim();

        var contrasena = configuracion[
            "AdministradorInicial:Contrasena"];

        if (string.IsNullOrWhiteSpace(correo) ||
            string.IsNullOrWhiteSpace(contrasena))
        {
            throw new InvalidOperationException(
                "Faltan las credenciales del administrador inicial.");
        }

        // Comprobar si la cuenta ya existe.
        var existente = await userManager.FindByEmailAsync(correo);

        if (existente is not null)
        {
            if (await userManager.IsInRoleAsync(
                existente, "Administrador"))
            {
                return;
            }

            throw new InvalidOperationException(
                "El correo ya pertenece a otro usuario. " +
                "No se elevaran sus privilegios automaticamente.");
        }

        var usuario = new Usuario
        {
            UserName = correo,
            Email = correo,
            Nombre = configuracion[
                "AdministradorInicial:Nombre"]?.Trim() ?? "Administrador",
            Apellido = configuracion[
                "AdministradorInicial:Apellido"]?.Trim() ?? "Inicial"
        };

        // Identity valida y almacena la contraseña
        // utilizando su mecanismo de hashing.
        var resultado = await userManager.CreateAsync(
            usuario,
            contrasena);

        if (!resultado.Succeeded)
        {
            var errores = string.Join(
                "; ",
                resultado.Errors.Select(e => e.Description));

            throw new InvalidOperationException(
                $"No se pudo crear el administrador: {errores}");
        }

        // Asignar el rol administrativo.
        var asignacion = await userManager.AddToRoleAsync(
            usuario,
            "Administrador");

        if (!asignacion.Succeeded)
        {
            await userManager.DeleteAsync(usuario);

            throw new InvalidOperationException(
                "No fue posible asignar el rol Administrador.");
        }
    }
}
