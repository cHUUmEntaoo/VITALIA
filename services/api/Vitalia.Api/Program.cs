using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Data;
using Vitalia.Api.Services;
using Vitalia.Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Vitalia.Api.Models;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<VitaliaDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );

    if (builder.Environment.IsDevelopment())
    {
        options.UseSeeding((context, _) =>
        {
            HospitalSeeder.Seed((VitaliaDbContext)context);
        });
    }
});




builder.Services.AddIdentityCore<Usuario>(options =>
{
    // Configuración de usuarios
    options.User.RequireUniqueEmail = true;

    // Política de contraseñas
    options.Password.RequiredLength = 12;
    options.Password.RequiredUniqueChars = 4;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;

    // Protección frente a intentos fallidos
    options.Lockout.DefaultLockoutTimeSpan =
        TimeSpan.FromMinutes(15);

    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<VitaliaDbContext>()
.AddSignInManager()
.AddDefaultTokenProviders();





builder.Services
    .AddAuthentication(IdentityConstants.BearerScheme)
    .AddBearerToken(IdentityConstants.BearerScheme);

builder.Services.AddAuthorization();



builder.Services.AddScoped<IHospitalService, HospitalSqlService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();

    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    await RoleSeeder.SeedAsync(roleManager);
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();
public partial class Program { }
