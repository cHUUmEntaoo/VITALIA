
# VITALIA — Modelo de datos v0.1

## Arquitectura de persistencia

- Motor: Microsoft SQL Server 2025.
- Backend: ASP.NET Core 10.
- ORM: Entity Framework Core 10.
- Migraciones mediante EF Core.

## Entidades iniciales

1. Hospital (implementada).
2. Usuario.
3. Rol.
4. UsuarioRol.
5. Paciente.
6. Medico.
7. Especialidad.
8. MedicoHospital.
9. MedicoEspecialidad.
10. HorarioMedico.
11. Cita.

## Reglas principales

- Un usuario puede tener diferentes roles.
- Los permisos administrativos pueden depender del hospital.
- Un paciente puede solicitar citas en diferentes hospitales.
- Un médico puede atender en varios hospitales.
- Un médico puede tener varias especialidades.
- Cada cita debe identificar al paciente, al médico,
  al hospital, a la especialidad y al horario.
- No se deben permitir citas superpuestas para
  un mismo médico.
- La información clínica tendrá controles de acceso
  y privacidad independientes.

## Próxima implementación

Diseñar Usuarios, Roles y sus relaciones antes
de generar nuevas migraciones.

## Gestión de usuarios y autorización

### Tecnología
Se utilizará ASP.NET Core Identity con Entity Framework Core.

### Entidades
- Usuario: extenderá IdentityUser.
- Rol: se utilizará IdentityRole.
- UsuarioRol: asociación administrada por Identity.
- UsuarioHospitalRol: permisos y asignaciones por hospital.
- Paciente: perfil independiente asociado al usuario.
- Medico: perfil profesional asociado al usuario.

### Roles iniciales
- Administrador
- Medico
- Recepcionista
- Paciente

### Reglas de seguridad
- Una cuenta podrá tener varios roles.
- Los permisos podrán limitarse por hospital.
- Un paciente podrá recibir atención en diferentes hospitales.
- Las credenciales serán gestionadas por Identity.
- Los permisos sobre expedientes clínicos se validarán
  independientemente del rol general.
- El acceso a la información médica será limitado
  según la función y las autorizaciones correspondientes.

### Integración con la base existente
- Se conservará la entidad Hospital.
- Se extenderá VitaliaDbContext para incorporar Identity.
- Se revisarán las migraciones antes de aplicarlas.
- No se eliminará ni recreará VitaliaDb.
