
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Vitalia.Api.Models;

namespace Vitalia.Api.Data;

public class VitaliaDbContext : IdentityDbContext<Usuario>
{


public DbSet<Medico> Medicos => Set<Medico>();

public DbSet<MedicoEspecialidad> MedicoEspecialidades =>
    Set<MedicoEspecialidad>();

public DbSet<MedicoHospital> MedicoHospitales =>
    Set<MedicoHospital>();

    public VitaliaDbContext(DbContextOptions<VitaliaDbContext> options)
        : base(options)
    {
    }

    public DbSet<Hospital> Hospitales => Set<Hospital>();
    public DbSet<Especialidad> Especialidades => Set<Especialidad>();
    public DbSet<Cita> Citas => Set<Cita>();
    public DbSet<HorarioMedico> HorariosMedicos => Set<HorarioMedico>();
    public DbSet<PerfilPaciente> PerfilesPacientes => Set<PerfilPaciente>();
    public DbSet<NotaClinica> NotasClinicas => Set<NotaClinica>();
    public DbSet<AuditoriaClinica> AuditoriasClinicas => Set<AuditoriaClinica>();

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



modelBuilder.Entity<Especialidad>(entity =>
{
    entity.ToTable("Especialidades");

    entity.HasKey(e => e.Id);

    entity.Property(e => e.Nombre)
        .IsRequired()
        .HasMaxLength(120);

    entity.HasIndex(e => e.Nombre)
        .IsUnique();

    entity.Property(e => e.Descripcion)
        .HasMaxLength(500);

    entity.Property(e => e.Activa)
        .IsRequired()
        .HasDefaultValue(true);
});



modelBuilder.Entity<Medico>(entity =>
{
    entity.ToTable("Medicos");

    entity.HasKey(m => m.Id);

    entity.Property(m => m.Nombre)
        .IsRequired()
        .HasMaxLength(100);

    entity.Property(m => m.Apellido)
        .IsRequired()
        .HasMaxLength(100);

    entity.Property(m => m.NumeroExequatur)
        .HasMaxLength(50);

    entity.Property(m => m.FotoUrl)
        .HasMaxLength(500);

    entity.Property(m => m.Activo)
        .IsRequired()
        .HasDefaultValue(true);

    entity.HasOne(m => m.Usuario)
        .WithOne()
        .HasForeignKey<Medico>(m => m.UsuarioId)
        .OnDelete(DeleteBehavior.Restrict);
});

modelBuilder.Entity<MedicoEspecialidad>(entity =>
{
    entity.ToTable("MedicoEspecialidades");

    entity.HasKey(me => new
    {
        me.MedicoId,
        me.EspecialidadId
    });

    entity.HasOne(me => me.Medico)
        .WithMany()
        .HasForeignKey(me => me.MedicoId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(me => me.Especialidad)
        .WithMany()
        .HasForeignKey(me => me.EspecialidadId)
        .OnDelete(DeleteBehavior.Restrict);
});

modelBuilder.Entity<MedicoHospital>(entity =>
{
    entity.ToTable("MedicoHospitales");

    entity.HasKey(mh => new
    {
        mh.MedicoId,
        mh.HospitalId
    });

    entity.HasOne(mh => mh.Medico)
        .WithMany()
        .HasForeignKey(mh => mh.MedicoId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(mh => mh.Hospital)
        .WithMany()
        .HasForeignKey(mh => mh.HospitalId)
        .OnDelete(DeleteBehavior.Restrict);
});



modelBuilder.Entity<HorarioMedico>(entity =>
{
    entity.ToTable("HorariosMedicos");
    entity.HasKey(h => h.Id);
    entity.Property(h => h.HoraInicio).HasColumnType("time(0)");
    entity.Property(h => h.HoraFin).HasColumnType("time(0)");
    entity.HasIndex(h => new { h.MedicoId, h.HospitalId, h.DiaSemana, h.HoraInicio }).IsUnique();
    entity.HasOne(h => h.Medico).WithMany().HasForeignKey(h => h.MedicoId).OnDelete(DeleteBehavior.Restrict);
    entity.HasOne(h => h.Hospital).WithMany().HasForeignKey(h => h.HospitalId).OnDelete(DeleteBehavior.Restrict);
});

modelBuilder.Entity<Cita>(entity =>
{
    entity.ToTable("Citas");
    entity.HasKey(c => c.Id);
    entity.Property(c => c.Fecha).HasColumnType("date");
    entity.Property(c => c.Hora).HasColumnType("time(0)");
    entity.Property(c => c.Estado).HasMaxLength(20).IsRequired();
    entity.Property(c => c.CreadaUtc).IsRequired();
    entity.HasIndex(c => new { c.MedicoId, c.Fecha, c.Hora })
        .IsUnique().HasFilter("[Estado] = 'Programada'");
    entity.HasIndex(c => new { c.PacienteId, c.Fecha });
    entity.HasOne(c => c.Paciente).WithMany().HasForeignKey(c => c.PacienteId).OnDelete(DeleteBehavior.Restrict);
    entity.HasOne(c => c.Medico).WithMany().HasForeignKey(c => c.MedicoId).OnDelete(DeleteBehavior.Restrict);
    entity.HasOne(c => c.Hospital).WithMany().HasForeignKey(c => c.HospitalId).OnDelete(DeleteBehavior.Restrict);
    entity.HasOne(c => c.Especialidad).WithMany().HasForeignKey(c => c.EspecialidadId).OnDelete(DeleteBehavior.Restrict);
});

modelBuilder.Entity<PerfilPaciente>(entity =>
{
    entity.ToTable("PerfilesPacientes");
    entity.HasKey(p => p.PacienteId);
    entity.Property(p => p.Aseguradora).HasMaxLength(120);
    entity.Property(p => p.NumeroAfiliacion).HasMaxLength(100);
    entity.HasOne(p => p.Paciente).WithOne().HasForeignKey<PerfilPaciente>(p => p.PacienteId)
        .OnDelete(DeleteBehavior.Cascade);
});

modelBuilder.Entity<NotaClinica>(entity =>
{
    entity.ToTable("NotasClinicas");
    entity.HasKey(n => n.Id);
    entity.HasIndex(n => n.CitaId).IsUnique();
    entity.HasIndex(n => new { n.PacienteId, n.MedicoId });
    entity.HasOne(n => n.Cita).WithOne().HasForeignKey<NotaClinica>(n => n.CitaId)
        .OnDelete(DeleteBehavior.Restrict);
    entity.HasOne<Medico>().WithMany().HasForeignKey(n => n.MedicoId)
        .OnDelete(DeleteBehavior.Restrict);
    entity.HasOne<Usuario>().WithMany().HasForeignKey(n => n.PacienteId)
        .OnDelete(DeleteBehavior.Restrict);
    entity.Property(n => n.PacienteId).IsRequired().HasMaxLength(450);
    entity.Property(n => n.MotivoConsulta).IsRequired().HasMaxLength(2000);
    entity.Property(n => n.Antecedentes).HasMaxLength(4000);
    entity.Property(n => n.Hallazgos).HasMaxLength(4000);
    entity.Property(n => n.Diagnostico).HasMaxLength(2000);
    entity.Property(n => n.Plan).HasMaxLength(4000);
    entity.Property(n => n.Indicaciones).HasMaxLength(4000);
    entity.Property(n => n.CreadaUtc).IsRequired();
    entity.Property(n => n.ActualizadaUtc).IsRequired();
});

modelBuilder.Entity<AuditoriaClinica>(entity =>
{
    entity.ToTable("AuditoriaClinica");
    entity.HasKey(a => a.Id);
    entity.Property(a => a.UsuarioId).IsRequired().HasMaxLength(450);
    entity.Property(a => a.Accion).IsRequired().HasMaxLength(80);
    entity.HasIndex(a => new { a.CitaId, a.FechaUtc });
    entity.HasIndex(a => new { a.UsuarioId, a.FechaUtc });
});

    }
}
