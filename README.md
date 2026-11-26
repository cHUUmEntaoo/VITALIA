# VITALIA — Sistema de gestión hospitalaria

VITALIA es un proyecto académico de ingeniería de software con aplicación móvil para pacientes y portal web para Administración, Medicina y Recepción. Trabaja con una API ASP.NET Core y SQL Server.

> **Estado: demostración académica.** Usar exclusivamente datos ficticios. No desplegar con pacientes reales ni presentar la versión actual como un producto sanitario listo para producción.

## Componentes

| Componente | Ubicación | Tecnología |
| --- | --- | --- |
| Portal institucional | `apps/web` | React 19, TypeScript, Vite |
| App del paciente | `apps/mobile` | React Native, Expo SDK 58, Expo Router |
| API y autenticación | `services/api/Vitalia.Api` | ASP.NET Core 10, C#, EF Core 10, ASP.NET Identity |
| Base de datos | SQL Server | Migraciones EF Core |
| Pruebas de API | `tests/Vitalia.Api.Tests` | xUnit, SQLite aislado para pruebas |
| Integración continua | `.github/workflows/ci.yml` | GitHub Actions |

## Funciones incluidas en la demostración

- **Paciente (móvil):** acceso, catálogo médico por sede y especialidad, consulta de disponibilidad, reserva, consulta y reprogramación/cancelación de citas según las reglas del servidor.
- **Recepción (web):** consulta de agenda y pacientes, reserva institucional y cancelación de citas permitidas.
- **Médico (web):** agenda del profesional vinculado, lectura y guardado de borradores clínicos, firma y finalización de consultas, historial autorizado.
- **Administración (web):** resumen institucional, gestión de médicos, horarios, personal y agenda.

La API aplica controles de rol y restricciones de cita. La revisión integral de seguridad clínica y permisos por sede sigue pendiente antes de utilizar datos reales.

## Requisitos de desarrollo

- Git y Visual Studio Code (o editor equivalente).
- **Node.js 24** y npm para portal y móvil.
- **.NET SDK 10**.
- **SQL Server** accesible para ejecutar la API de desarrollo.
- Android físico o emulador y herramientas de Expo para la app móvil.

> Para **editar el diseño** de Recepción en `apps/web/src/App.tsx` y `App.css`, no hace falta SQL Server. Para probar inicio de sesión, citas y otras funciones conectadas sí se necesita la API y una base de datos de demostración.

## Instalación local — Windows / PowerShell

Desde la carpeta raíz del repositorio, comprobar las herramientas:

```powershell
node -v
npm -v
git --version
dotnet --version
```

### 1. API y base de datos

Configurar una conexión SQL Server propia **en secretos de usuario locales**, nunca en GitHub:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=VitaliaDb;Trusted_Connection=True;TrustServerCertificate=True" --project .\services\api\Vitalia.Api
```

La cadena es **solo un ejemplo** para una instancia local con autenticación Windows; modificar el servidor y el tipo de autenticación según la instalación.

Crear o actualizar el esquema de la base de datos de prueba:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet tool restore
dotnet ef database update --project .\services\api\Vitalia.Api --startup-project .\services\api\Vitalia.Api
```

En una terminal, iniciar la API:

```powershell
dotnet run --project .\services\api\Vitalia.Api --launch-profile http
```

La configuración `http` sirve en `http://localhost:5208`. Las credenciales de demostración y cualquier aprovisionamiento inicial se gestionan **localmente**, nunca se publican en este documento.

### 2. Portal web

Abrir **otra terminal** desde el repositorio:

```powershell
cd .\apps\web
npm ci
npm run dev
```

Abrir `http://localhost:5173`. El proxy de Vite dirige las solicitudes `/api` a `http://localhost:5208` por defecto.

### 3. Aplicación del paciente

Abrir **otra terminal** desde el repositorio:

```powershell
cd .\apps\mobile
npm ci
npx expo start
```

Para usar Android físico, configurar la URL de la API correspondiente al equipo de desarrollo mediante `EXPO_PUBLIC_API_URL`, en un entorno local no versionado. El teléfono y el servidor deberán poder comunicarse. Las compilaciones de prueba EAS existentes pueden conservar una dirección IP privada de desarrollo y no representan un despliegue comercial.

## Verificación

Desde la carpeta raíz:

```powershell
dotnet test .\tests\Vitalia.Api.Tests\Vitalia.Api.Tests.csproj
cd .\apps\web
npm run build
cd ..\mobile
npx tsc --noEmit
```

GitHub Actions realiza verificaciones de API, portal y TypeScript móvil cuando se actualiza una rama configurada.

## Presentación y alcance

Consulta `docs/GUIA_PRESENTACION_VITALIA.md` para el recorrido de demostración y las comprobaciones previas. El diseño institucional **v10** sigue siendo la referencia de aceptación visual y funcional; hay que contrastar cada pantalla y comportamiento antes de declarar la entrega académica completamente cerrada.

### Antes de una venta o uso comercial

Faltan, entre otros: HTTPS y entorno de despliegue seguro, evaluación de riesgos, pruebas de permisos por sede y por paciente, auditoría clínica más completa, respaldos y restauración, manejo formal de datos sensibles, documentación contractual/legal y sustitución o autorización del material de muestra (incluidas fotografías). **No usar datos médicos reales en esta versión.**

## Colaboración

Trabajar en ramas propias y abrir un Pull Request. Evitar subir `.env`, claves, archivos de configuración locales, respaldos de SQL Server y datos personales.
