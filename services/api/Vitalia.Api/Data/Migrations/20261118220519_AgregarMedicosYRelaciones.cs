using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vitalia.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMedicosYRelaciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Medicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NumeroExequatur = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FotoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    UsuarioId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Medicos_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicoEspecialidades",
                columns: table => new
                {
                    MedicoId = table.Column<int>(type: "int", nullable: false),
                    EspecialidadId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicoEspecialidades", x => new { x.MedicoId, x.EspecialidadId });
                    table.ForeignKey(
                        name: "FK_MedicoEspecialidades_Especialidades_EspecialidadId",
                        column: x => x.EspecialidadId,
                        principalTable: "Especialidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicoEspecialidades_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicoHospitales",
                columns: table => new
                {
                    MedicoId = table.Column<int>(type: "int", nullable: false),
                    HospitalId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicoHospitales", x => new { x.MedicoId, x.HospitalId });
                    table.ForeignKey(
                        name: "FK_MedicoHospitales_Hospitales_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicoHospitales_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicoEspecialidades_EspecialidadId",
                table: "MedicoEspecialidades",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicoHospitales_HospitalId",
                table: "MedicoHospitales",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_UsuarioId",
                table: "Medicos",
                column: "UsuarioId",
                unique: true,
                filter: "[UsuarioId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicoEspecialidades");

            migrationBuilder.DropTable(
                name: "MedicoHospitales");

            migrationBuilder.DropTable(
                name: "Medicos");
        }
    }
}
