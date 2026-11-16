import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE = '@vitalia/citas-demo-v1';

export type CitaDemo = {
  id: string;
  ciudad: string;
  hospital: string;
  especialidad: string;
  medico: string;
  fecha: string;
  hora: string;
  estado: 'programada' | 'cancelada';
};

type NuevaCitaDemo = Omit<CitaDemo, 'id' | 'estado'>;

export async function obtenerCitasDemo(): Promise<CitaDemo[]> {
  const contenido = await AsyncStorage.getItem(CLAVE);

  if (!contenido) {
    return [];
  }

  const resultado: unknown = JSON.parse(contenido);

  if (!Array.isArray(resultado)) {
    return [];
  }

  return resultado as CitaDemo[];
}

export async function guardarCitaDemo(
  datos: NuevaCitaDemo
): Promise<CitaDemo> {
  const citas = await obtenerCitasDemo();

  const nuevaCita: CitaDemo = {
    ...datos,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    estado: 'programada',
  };

  await AsyncStorage.setItem(
    CLAVE,
    JSON.stringify([nuevaCita, ...citas])
  );

  return nuevaCita;
}

export async function cancelarCitaDemo(
  id: string
): Promise<void> {
  const citas = await obtenerCitasDemo();

  const actualizadas = citas.map((cita) =>
    cita.id === id
      ? { ...cita, estado: 'cancelada' as const }
      : cita
  );

  await AsyncStorage.setItem(
    CLAVE,
    JSON.stringify(actualizadas)
  );
}

export async function reprogramarCitaDemo(
  id: string,
  fecha: string,
  hora: string
): Promise<void> {
  const citas = await obtenerCitasDemo();
  const original = citas.find((cita) => cita.id === id);
  if (!original) throw new Error('Cita no encontrada');
  if (original.estado !== 'programada') throw new Error('La cita esta cancelada');
  if (!fecha || !hora) throw new Error('Fecha y hora obligatorias');
  const actualizadas = citas.map((cita) =>
    cita.id === id ? { ...cita, fecha, hora } : cita
  );
  await AsyncStorage.setItem(CLAVE, JSON.stringify(actualizadas));
}
