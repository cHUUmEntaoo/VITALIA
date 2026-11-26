using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vitalia.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class SprintCitasPerfilYHorarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Citas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PacienteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicoId = table.Column<int>(type: "int", nullable: false),
                    HospitalId = table.Column<int>(type: "int", nullable: false),
                    EspecialidadId = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    Hora = table.Column<TimeOnly>(type: "time(0)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreadaUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Citas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Citas_AspNetUsers_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Citas_Especialidades_EspecialidadId",
                        column: x => x.EspecialidadId,
                        principalTable: "Especialidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Citas_Hospitales_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Citas_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HorariosMedicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MedicoId = table.Column<int>(type: "int", nullable: false),
                    HospitalId = table.Column<int>(type: "int", nullable: false),
                    DiaSemana = table.Column<int>(type: "int", nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time(0)", nullable: false),
                    HoraFin = table.Column<TimeOnly>(type: "time(0)", nullable: false),
                    IntervaloMinutos = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HorariosMedicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HorariosMedicos_Hospitales_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HorariosMedicos_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PerfilesPacientes",
                columns: table => new
                {
                    PacienteId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TieneSeguro = table.Column<bool>(type: "bit", nullable: false),
                    Aseguradora = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    NumeroAfiliacion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesPacientes", x => x.PacienteId);
                    table.ForeignKey(
                        name: "FK_PerfilesPacientes_AspNetUsers_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Citas_EspecialidadId",
                table: "Citas",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_HospitalId",
                table: "Citas",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_MedicoId_Fecha_Hora",
                table: "Citas",
                columns: new[] { "MedicoId", "Fecha", "Hora" },
                unique: true,
                filter: "[Estado] = 'Programada'");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_PacienteId_Fecha",
                table: "Citas",
                columns: new[] { "PacienteId", "Fecha" });

            migrationBuilder.CreateIndex(
                name: "IX_HorariosMedicos_HospitalId",
                table: "HorariosMedicos",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_HorariosMedicos_MedicoId_HospitalId_DiaSemana_HoraInicio",
                table: "HorariosMedicos",
                columns: new[] { "MedicoId", "HospitalId", "DiaSemana", "HoraInicio" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Citas");

            migrationBuilder.DropTable(
                name: "HorariosMedicos");

            migrationBuilder.DropTable(
                name: "PerfilesPacientes");
        }
    }
}
