import { cancelarCita, listarCitas, reprogramarCita } from '@/lib/vitalia-api';

export type CitaServidor = {
  id: string;
  medicoId: number;
  hospitalId: number;
  especialidadId: number;
  ciudad: string;
  hospital: string;
  especialidad: string;
  medico: string;
  fecha: string;
  hora: string;
  estado: 'programada' | 'cancelada' | 'atendida';
};

export async function obtenerCitasServidor(): Promise<CitaServidor[]> {
  const citas = await listarCitas();
  return citas.map((c) => ({
    ...c,
    id: String(c.id),
    hora: c.hora.slice(0, 5),
    estado: c.estado.toLowerCase() as 'programada' | 'cancelada' | 'atendida',
  }));
}

export async function cancelarCitaServidor(id: string) {
  return cancelarCita(Number(id));
}

export async function reprogramarCitaServidor(id: string, fecha: string, hora: string) {
  return reprogramarCita(Number(id), fecha, hora);
}
