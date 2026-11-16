# VITALIA · Portales institucionales (demo)

Versión 0.2 · 16 de noviembre de 2026

## Acceso

Desde `C:\Users\Jesus\Projects\VITALIA\apps\web`:

```powershell
npm.cmd run dev
```

Abre `http://localhost:5173/vitalia-roles/index.html` en Edge o Chrome (si Vite anuncia otro puerto, úsalo). El consultorio médico aprobado v8 está copiado sin modificaciones en `http://localhost:5173/medico-v8/medico.html`.

## Alcance implementado

**Administración:** dashboard multi-centro, directorio y alta/edición de hospitales, médicos, recepcionistas, pacientes, aseguradoras; agenda general; reasignación y cancelación con motivo; cobros ficticios y reversión; informes, exportación CSV, bitácora y matriz ilustrativa de permisos.

**Recepción:** jornada, búsqueda de citas por identificador o paciente, registro de pacientes ficticios, nueva cita con detección de conflicto, reprogramación y cancelación, verificación de llegada, cambios de cobertura, registro de cobros ficticios sin tarjetas y comprobante de demostración, avisos internos y seguimiento administrativo.

**Médico:** agenda de Dra. Ana Torres, filtro de citas propias, bloqueo de iniciar atención sin llegada registrada, paso a "En consulta" y "Atendida" administrativos, directorio de pacientes ficticios y acceso al consultorio aprobado v8 sin alterar sus archivos.

## Demostración inter-roles

1. Accede como **Recepcionista** y abre **Llegadas y turnos**.
2. Confirma llegada de `APT-1002` (paciente ficticia Laura Méndez).
3. Cambia a **Médico** desde la esquina superior derecha.
4. Abre **Mi agenda**: `APT-1002` debe mostrar **Llegó**.
5. Pulsa **Iniciar** y desde el detalle pulsa **Finalizar atención demo**.
6. Cambia a **Administración** y comprueba el estado **Atendida** en **Agenda general** e **Informes**.
7. En **Auditoría** consulta todos los cambios.
8. Regresa a Recepción, registra un cobro ficticio y verifica su estado en Administración.

## Límites deliberados

- **NO hay autenticación**: cambiar rol es solo una simulación visual.
- **NO hay SQL Server ni API conectados**: los cambios se guardan en `localStorage` del origen `localhost:5173`. Varias pestañas del mismo navegador y origen comparten datos; otros navegadores o equipos no.
- **La app Android NO se sincroniza** con estos portales aún: usa AsyncStorage y requiere integración posterior con API.
- **El consultorio v8 conserva su almacén local independiente**; el médico no debe entender que `Atendida` en la agenda equivale a nota médica firmada.
- No introducir cédulas, datos médicos, contraseñas, seguros ni importes reales.
- NO procesar cobros ni enviar notificaciones reales. No cuenta con cumplimiento normativo clínico.
- El dashboard implementa flujos esenciales e interacción, pero **NO reproduce todavía los 117+91+84 escenarios documentados uno por uno** en la presentación aprobada v10.

## Diseño y continuidad

Paleta conservada: verde bosque `#173D32`, marfil `#F8F5ED`, dorado `#C6A76A`. El consultorio médico v8 se conserva con sus archivos originales sin alteración. La siguiente fase migrará el almacenamiento demo a contratos tipados ASP.NET Core 10 / EF Core / SQL Server, con RBAC y auditoría de servidor.

## Ubicación de instalación

Se copia únicamente dentro de `apps/web/public/vitalia-roles` y `apps/web/public/medico-v8`. Si existen carpetas previas con esos nombres, el instalador las respalda en `apps/web/backups/vitalia-roles-...` antes de instalar. No cambia `src/`, `vite.config.ts`, el backend, la base de datos ni archivos de la app móvil.
