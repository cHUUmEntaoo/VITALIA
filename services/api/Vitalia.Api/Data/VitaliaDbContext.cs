
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Models;

namespace Vitalia.Api.Data;

public class VitaliaDbContext : IdentityDbContext<Usuario>
{
    public VitaliaDbContext(DbContextOptions<VitaliaDbContext> options)
        : base(options)
    {
    }

    public DbSet<Hospital> Hospitales => Set<Hospital>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)

    {
        base.OnModelCreating(modelBuilder);


modelBuilder.Entity<Usuario>(entity =>
{
    entity.Property(u => u.Nombre)
        .IsRequired()
        .HasMaxLength(100);

    entity.Property(u => u.Apellido)
        .IsRequired()
        .HasMaxLength(100);

    entity.Property(u => u.FechaRegistroUtc)
        .IsRequired();
});


        modelBuilder.Entity<Hospital>(entity =>
        {
            entity.ToTable("Hospitales");

            entity.HasKey(h => h.Id);

            entity.Property(h => h.Nombre)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(h => h.Ciudad)
                .IsRequired()
                .HasMaxLength(100);
        });
    }
}
