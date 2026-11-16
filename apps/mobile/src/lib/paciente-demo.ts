import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE = '@vitalia/paciente-demo-v1';

export type PacienteDemo = {
  nombre: string;
  correo: string;
  telefono: string;
  asegurado: 'si' | 'no' | '';
  ars: string;
  afiliacion: string;
};

const inicial: PacienteDemo = {
  nombre: 'Paciente VITALIA',
  correo: '',
  telefono: '',
  asegurado: '',
  ars: '',
  afiliacion: '',
};

export async function leerPacienteDemo(): Promise<PacienteDemo> {
  const texto = await AsyncStorage.getItem(CLAVE);
  if (!texto) return { ...inicial };
  try {
    const objeto: unknown = JSON.parse(texto);
    if (typeof objeto !== 'object' || objeto === null || Array.isArray(objeto)) {
      return { ...inicial };
    }
    return { ...inicial, ...(objeto as Partial<PacienteDemo>) };
  } catch {
    return { ...inicial };
  }
}

export async function actualizarPacienteDemo(
  cambios: Partial<PacienteDemo>
): Promise<PacienteDemo> {
  const actual = await leerPacienteDemo();
  const nuevo: PacienteDemo = { ...actual, ...cambios };
  await AsyncStorage.setItem(CLAVE, JSON.stringify(nuevo));
  return nuevo;
}
