using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vitalia.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ClinicaNotasYAuditoriaDemo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditoriaClinica",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CitaId = table.Column<int>(type: "int", nullable: false),
                    Accion = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    FechaUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditoriaClinica", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotasClinicas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CitaId = table.Column<int>(type: "int", nullable: false),
                    MedicoId = table.Column<int>(type: "int", nullable: false),
                    PacienteId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    MotivoConsulta = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Antecedentes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Hallazgos = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Diagnostico = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Plan = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Indicaciones = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CreadaUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActualizadaUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FirmadaUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotasClinicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotasClinicas_AspNetUsers_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NotasClinicas_Citas_CitaId",
                        column: x => x.CitaId,
                        principalTable: "Citas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NotasClinicas_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaClinica_CitaId_FechaUtc",
                table: "AuditoriaClinica",
                columns: new[] { "CitaId", "FechaUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriaClinica_UsuarioId_FechaUtc",
                table: "AuditoriaClinica",
                columns: new[] { "UsuarioId", "FechaUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_NotasClinicas_CitaId",
                table: "NotasClinicas",
                column: "CitaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotasClinicas_MedicoId",
                table: "NotasClinicas",
                column: "MedicoId");

            migrationBuilder.CreateIndex(
                name: "IX_NotasClinicas_PacienteId_MedicoId",
                table: "NotasClinicas",
                columns: new[] { "PacienteId", "MedicoId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditoriaClinica");

            migrationBuilder.DropTable(
                name: "NotasClinicas");
        }
    }
}
