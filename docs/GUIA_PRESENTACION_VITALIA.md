# VITALIA — Guía de presentación y cierre académico

**Estado:** versión de demostración; usar datos ficticios y una base de datos de pruebas.

## 1. Preparar los cuatro entornos

1. Verificar que el repositorio local apunta al commit aprobado del Pull Request integrado en `main`. No asumir que un `git fetch` fusiona las ramas.
2. Confirmar que SQL Server tiene las migraciones aplicadas y el catálogo de demostración disponible.
3. Iniciar la API `services/api/Vitalia.Api` y el portal `apps/web`.
4. Comprobar conectividad de Android a la API, sin asumir que una IP privada previamente compilada sigue vigente.
5. Utilizar cuentas de **demostración distintas** para cada rol; nunca compartir cuentas reales ni contraseñas en las diapositivas.

## 2. Recorrido sugerido — 8 a 12 minutos

| Tiempo aproximado | Rol | Evidencia en pantalla |
| --- | --- | --- |
| 1 minuto | Introducción | Objetivo de VITALIA, tres sedes de muestra y arquitectura Android + Web + API + SQL Server |
| 2 minutos | Paciente | Iniciar sesión, filtrar médico por sede/especialidad, elegir fecha/hora y confirmar una cita |
| 2 minutos | Recepción | Verificar que la cita aparece en la agenda y revisar el registro del paciente |
| 2 minutos | Médico | Abrir agenda del profesional asignado, redactar nota ficticia, guardar borrador y finalizar con firma |
| 1 minuto | Administración | Ver indicadores, directorio, personal y horarios |
| 1 minuto | Pruebas | Enseñar el resultado de GitHub Actions y explicar validaciones de la API |
| 1 minuto | Cierre | Alcance académico, limitaciones y propuesta de futuras mejoras |

**Preparación:** crear una cita nueva y un paciente de prueba para la exposición. No reutilizar datos clínicos auténticos.

## 3. Lista de aceptación antes de presentar

- [ ] El código integrado está en `main` y el árbol local no contiene modificaciones sin revisar.
- [ ] Las pruebas automáticas del commit final están en verde.
- [ ] API, web y SQL Server inician sin errores.
- [ ] Un paciente ficticio puede reservar una cita disponible.
- [ ] Recepción muestra la misma cita registrada en la API.
- [ ] El médico vinculado ve su agenda y solo modifica su propia nota clínica.
- [ ] Una nota firmada no permite la sobrescritura desde un borrador anterior.
- [ ] Administración muestra la información y los horarios correctos del médico seleccionado.
- [ ] Revisión manual contra la presentación **VITALIA v10**, pantalla por pantalla.
- [ ] Confirmación de nombres, especialidades y fotografías de la **lista original aprobada** de profesionales, sin inventar identidades.
- [ ] La presentación y sus capturas muestran únicamente datos de demostración.

## 4. Qué no afirmar en la presentación

No declarar que el sistema está preparado para pacientes reales, que cumple toda la normativa sanitaria aplicable, que tiene disponibilidad en la nube o que todo el flujo operativo está implementado conforme a la v10 si no se ha comprobado.

La versión actual usa un backend real, autenticación con roles, SQL Server y pruebas automatizadas, pero sus controles de acceso sanitario, operaciones por sede y despliegue seguro requieren trabajo adicional.

## 5. Paso comercial posterior — separado del hito universitario

- Definir cliente objetivo (consultorio, centro médico u hospital) y funcionalidades contratadas.
- Completar revisión legal y de privacidad en República Dominicana, incluyendo obligaciones por tratamiento de datos de salud y condiciones contractuales.
- Aislar datos por institución/sede y verificar permisos en API, no solo en la interfaz.
- Implementar alojamiento con HTTPS, respaldos cifrados, restauración probada, monitoreo, gestión de secretos y plan de incidentes.
- Completar pruebas de seguridad, concurrencia y aceptación con datos sintéticos.
- Sustituir datos y fotografías de muestra por materiales con autorización expresa.
- Elaborar propuesta comercial, demostración guiada, soporte, costos de infraestructura y mantenimiento.

> Se puede presentar el software como **prototipo demostrable** y conversar con clientes potenciales desde ahora; su uso clínico real necesita una fase específica de producto, seguridad y validación.
