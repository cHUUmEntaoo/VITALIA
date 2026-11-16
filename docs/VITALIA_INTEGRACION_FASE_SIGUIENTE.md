# VITALIA — Contrato de integración propuesto (no implementado)

**Estado:** borrador para implementar después del sprint visual. No aplicar como esquema final sin revisar el backend y la base de datos reales.

## Arquitectura

- **Android:** `apps/mobile`, Expo / React Native; SDK 58; `AsyncStorage` solo para demostración, después cliente HTTP con autenticación, tokens protegidos y persistencia local mínima.
- **Web:** `apps/web`, React / TypeScript / Vite. El prototipo institucional en `/public/vitalia-roles` usa `localStorage` para simular procesos entre roles; se migrará a componentes React y cliente API tipado sin afectar la v8.
- **API:** `apps/api`, ASP.NET Core 10 + EF Core 10, autenticación y autorización por rol **desde el servidor**.
- **SQL Server:** fuente de verdad transaccional, operaciones y auditoría.

## Entidades mínimas (propuesta)

`Hospital`, `Specialty`, `Doctor`, `DoctorHospital`, `Patient`, `Appointment`, `DoctorAvailability`, `InsuranceProvider`, `InsurancePolicy`, `CheckIn`, `Payment`, `Notification`, `ClinicalEncounter`, `ClinicalNote`, `AuditEvent`, `UserAccount`, `RoleAssignment`, `Consent`.

No registrar información clínica real hasta disponer de seguridad y permisos validados.

## Estados y transiciones

`Solicitada → Confirmada → Llegó → En consulta → Atendida`.

Excepciones: `Cancelada`, `Ausente`. Definir guardas en la API por rol, disponibilidad y transición permitida. No aceptar un estado ni un rol de cliente como autoridad.

## Endpoints sugeridos (todos sujetos a autorización)

- `GET /api/hospitals`, `GET /api/specialties`, `GET /api/doctors?hospitalId=&specialtyId=`.
- `GET /api/availability?doctorId=&date=`.
- `POST /api/appointments`: Crear transaccionalmente y reservar cupo.
- `GET /api/appointments/mine`: Paciente autenticado; **nunca por ID de paciente libre enviado desde el móvil**.
- `GET /api/appointments?hospitalId=&date=`: Personal autorizado y filtrado por sede / rol.
- `PATCH /api/appointments/{id}/confirm`, `/reschedule`, `/cancel`: Acciones con validación y motivo.
- `POST /api/appointments/{id}/check-in`: Solo recepción / rol autorizado.
- `POST /api/appointments/{id}/start`, `/complete`: Solo profesional asignado y según llegada/estado clínico.
- `POST /api/payments`: Referencia de sistema de cobro externo, idempotencia, sin almacenar PAN/CVV.
- `GET /api/audit`: Administración autorizada, alcance mínimo.
- `GET /api/clinical/encounters/{id}`: Médico autorizado por paciente, sede y relación clínica; anotar cada acceso.

## Reglas técnicas imprescindibles

1. Concurrencia: bloqueo transaccional o índice/regla única por médico + fecha + hora para impedir reservas duplicadas.
2. Validaciones de paciente, cobertura, horarios de sede, cierres de agenda y cancelaciones.
3. Protección por roles y alcance; el médico solo puede consultar pacientes autorizados, recepción sin acceso a diagnósticos y notas SOAP.
4. Conservar notas firmadas como inmutables y corregir con adendas auditadas.
5. Auditoría en servidor con correlación, marca UTC y actor autenticado.
6. TLS, CORS restringido, almacenamiento seguro de secretos, cifrado/gestión de claves, respaldos SQL y procedimientos de restauración.
7. Notificaciones mediante cola, reintentos e idempotencia; consentimiento y preferencias.
8. No almacenar datos clínicos en localStorage ni enviar historiales a logs.
9. Protección especial de datos sensibles, consentimiento y revisión del marco legal sanitario dominicano antes de producción.
10. Pruebas: reservas concurrentes, autenticación, autorización, negativos, errores, integridad y flujos inter-roles.

## Test de aceptación integrado

Paciente Android crea cita -> SQL Server registra cita -> Recepción ve la misma cita -> Recepción confirma llegada -> Médico ve llegada -> Médico inicia/termina según reglas -> Administración consulta indicadores y auditoría -> Paciente recibe estado actualizado. Hasta conectar la API, este circuito **NO** está implementado entre Android y Web.

## Generación de una app Android instalable (fase posterior)

La app ya es React Native. Un APK propio no exige reescribir toda la interfaz. Ejemplo de `apps/mobile/eas.json` a revisar con el archivo real:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

Después de configurar identificador `android.package`, permisos y el proyecto EAS:

```powershell
cd C:\Users\Jesus\Projects\VITALIA\apps\mobile
npm.cmd install --global eas-cli
eas.cmd login
eas.cmd build:configure
eas.cmd build --platform android --profile preview
```

EAS Build requiere acceso a Internet y cuenta de Expo; el APK resultante se descarga desde la compilación completada. Antes del lanzamiento público hace falta configurar firma, API de producción, secretos, política de privacidad, pruebas y publicación Android. Para Play Store se usa normalmente AAB firmado.

Documentación de referencia: https://docs.expo.dev/build-reference/apk/ y https://docs.expo.dev/build/eas-json/.
