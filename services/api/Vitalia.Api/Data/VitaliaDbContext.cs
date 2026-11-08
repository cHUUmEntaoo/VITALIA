using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Models;

namespace Vitalia.Api.Data;

public class VitaliaDbContext : DbContext
{
    public VitaliaDbContext(DbContextOptions<VitaliaDbContext> options) : base(options)
    {
    }

    public DbSet<Hospital> Hospitales => Set<Hospital>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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