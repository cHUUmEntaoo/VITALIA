import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'vitalia.accessToken';
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/$/, '');

export type Hospital = { id: number; nombre: string; ciudad: string };
export type Especialidad = { id: number; nombre: string; descripcion: string; activa: boolean };
export type Medico = { id: number; nombre: string; apellido: string; fotoUrl: string | null; numeroExequatur: string | null; hospitalIds: number[]; especialidadIds: number[] };
export type Cita = { id: number; medicoId: number; hospitalId: number; especialidadId: number; medico: string; hospital: string; ciudad: string; especialidad: string; fecha: string; hora: string; estado: 'Programada' | 'Cancelada' | 'Atendida' };
export type PerfilPaciente = { id: string; nombre: string; apellido: string; correo: string; telefono: string | null; tieneSeguro: boolean; aseguradora: string | null; numeroAfiliacion: string | null };
export type ActualizarPerfil = Pick<PerfilPaciente, 'nombre' | 'apellido' | 'telefono' | 'tieneSeguro' | 'aseguradora' | 'numeroAfiliacion'>;

export class ErrorVitalia extends Error {
  constructor(public codigo: number, mensaje: string) { super(mensaje); }
}

async function solicitud<T>(ruta: string, metodo = 'GET', datos?: unknown, protegido = false): Promise<T> {
  if (!API_URL || !/^https?:\/\//.test(API_URL)) {
    throw new Error('Falta EXPO_PUBLIC_API_URL. Configura la dirección IP de tu computadora.');
  }
  const token = protegido ? await SecureStore.getItemAsync(TOKEN_KEY) : null;
  if (protegido && !token) throw new ErrorVitalia(401, 'Inicia sesión para continuar.');
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      Accept: 'application/json',
      ...(datos === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(datos === undefined ? {} : { body: JSON.stringify(datos) }),
  });
  if (!respuesta.ok) {
    let mensaje = `Error del servidor (${respuesta.status}).`;
    try {
      const error = (await respuesta.json()) as { mensaje?: string; title?: string };
      mensaje = error.mensaje ?? error.title ?? mensaje;
    } catch { /* El servidor no devolvió JSON. */ }
    throw new ErrorVitalia(respuesta.status, mensaje);
  }
  if (respuesta.status === 204) return undefined as T;
  return (await respuesta.json()) as T;
}

export async function registrarPaciente(nombre: string, apellido: string, correo: string, contrasena: string) {
  return solicitud<{ id: string }>('/api/auth/registro-paciente', 'POST', {
    nombre, apellido, correoElectronico: correo, contrasena,
  });
}

export async function iniciarSesion(correo: string, contrasena: string) {
  const sesion = await solicitud<{ accessToken: string }>('/api/auth/login', 'POST', {
    correoElectronico: correo, contrasena,
  });
  if (!sesion.accessToken) throw new Error('El servidor no devolvió el token de acceso.');
  await SecureStore.setItemAsync(TOKEN_KEY, sesion.accessToken);
  try { await obtenerPerfil(); }
  catch (e) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    throw e;
  }
}

export async function cerrarSesion() { await SecureStore.deleteItemAsync(TOKEN_KEY); }
export async function haySesion() { return Boolean(await SecureStore.getItemAsync(TOKEN_KEY)); }
export async function obtenerHospitales() { return solicitud<Hospital[]>('/api/hospitales'); }
export async function obtenerEspecialidades() { return solicitud<Especialidad[]>('/api/especialidades'); }
export async function obtenerMedicos(hospitalId: number, especialidadId: number) {
  return solicitud<Medico[]>(`/api/medicos?hospitalId=${hospitalId}&especialidadId=${especialidadId}`);
}
export async function obtenerDisponibilidad(medicoId: number, hospitalId: number, fecha: string) {
  const datos = await solicitud<{ horas: string[] }>(`/api/medicos/${medicoId}/disponibilidad?hospitalId=${hospitalId}&fecha=${encodeURIComponent(fecha)}`);
  return datos.horas;
}
export async function obtenerPerfil() { return solicitud<PerfilPaciente>('/api/pacientes/mi-perfil', 'GET', undefined, true); }
export async function guardarPerfil(perfil: ActualizarPerfil) { return solicitud<PerfilPaciente>('/api/pacientes/mi-perfil', 'PUT', perfil, true); }
export async function listarCitas() { return solicitud<Cita[]>('/api/citas/mis-citas', 'GET', undefined, true); }
export async function crearCita(medicoId: number, hospitalId: number, especialidadId: number, fecha: string, hora: string) {
  return solicitud<{ id: number }>('/api/citas', 'POST', { medicoId, hospitalId, especialidadId, fecha, hora }, true);
}
export async function cancelarCita(id: number) { return solicitud(`/api/citas/${id}/cancelar`, 'PATCH', undefined, true); }
export async function reprogramarCita(id: number, fecha: string, hora: string) {
  return solicitud(`/api/citas/${id}/reprogramar`, 'PATCH', { fecha, hora }, true);
}
