import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  obtenerCitasDemo, reprogramarCitaDemo, type CitaDemo,
} from '@/lib/citas-demo';

const verde = '#173D32';
const marfil = '#F8F5ED';
const dorado = '#C6A76A';
const horas = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

function fechasDisponibles() {
  return Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const valor = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    return { valor, texto: d.toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short' }) };
  });
}

export default function Reprogramar() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [cita, setCita] = useState<CitaDemo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const fechas = useMemo(() => fechasDisponibles(), []);

  useEffect(() => {
    let activo = true;
    obtenerCitasDemo()
      .then((lista) => { if (activo) setCita(lista.find((item) => item.id === id) ?? null); })
      .catch(() => Alert.alert('Error', 'No se pudo consultar la cita.'))
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [id]);

  async function guardar() {
    if (!id || !fecha || !hora || !cita || cita.estado !== 'programada') return;
    try {
      setGuardando(true);
      await reprogramarCitaDemo(id, fecha, hora);
      Alert.alert('Cita actualizada', 'La fecha y hora de demostración fueron modificadas en este teléfono.', [
        { text: 'Ver mis citas', onPress: () => router.replace('/mis-citas') },
      ]);
    } catch {
      Alert.alert('Error', 'No fue posible modificar la cita.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.top}>
          <Pressable onPress={() => router.replace('/mis-citas')}><Text style={s.back}>‹ Mis citas</Text></Pressable>
          <Text style={s.logo}>✚ VITALIA</Text>
          <Text style={s.eyebrow}>GESTIÓN DE CITAS</Text>
          <Text style={s.title}>Reprogramar cita</Text>
          <Text style={s.subtitle}>Selecciona otra fecha y hora de demostración.</Text>
        </View>
        <View style={s.body}>
          <Text style={s.demo}>HORARIOS FICTICIOS · SIN RESERVA REAL</Text>
          {cargando ? <ActivityIndicator color={verde} style={{ marginTop: 40 }} /> : !cita ? (
            <View style={s.card}><Text style={s.heading}>No encontramos la cita solicitada.</Text></View>
          ) : cita.estado === 'cancelada' ? (
            <View style={s.card}><Text style={s.heading}>Una cita cancelada no se puede reprogramar.</Text></View>
          ) : (
            <>
              <View style={s.card}>
                <Text style={s.small}>CITA ACTUAL</Text>
                <Text style={s.heading}>{cita.especialidad}</Text>
                <Text style={s.details}>{cita.medico} · {cita.hospital}</Text>
                <Text style={s.details}>{cita.fecha} · {cita.hora}</Text>
              </View>
              <Text style={s.section}>NUEVA FECHA</Text>
              <View style={s.grid}>
                {fechas.map((dia) => (
                  <Pressable key={dia.valor} style={[s.option, fecha === dia.valor && s.selected]}
                    onPress={() => setFecha(dia.valor)}>
                    <Text style={[s.optionText, fecha === dia.valor && s.selectedText]}>{dia.texto}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={s.section}>NUEVA HORA</Text>
              <View style={s.grid}>
                {horas.map((h) => (
                  <Pressable key={h} style={[s.option, hora === h && s.selected]}
                    onPress={() => setHora(h)}>
                    <Text style={[s.optionText, hora === h && s.selectedText]}>{h}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={[s.button, (!fecha || !hora || guardando) && s.dim]}
                disabled={!fecha || !hora || guardando} onPress={guardar}>
                <Text style={s.buttonText}>{guardando ? 'Guardando...' : 'Guardar nueva fecha y hora →'}</Text>
              </Pressable>
            </>
          )}
          <Text style={s.footer}>VITALIA · CUIDAMOS DE TI</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: verde },
  page: { flexGrow: 1, backgroundColor: marfil },
  top: { backgroundColor: verde, padding: 25, paddingBottom: 40 },
  back: { color: marfil, marginBottom: 29, fontSize: 14 },
  logo: { color: '#FFF', fontSize: 22, fontWeight: '700', letterSpacing: 3 },
  eyebrow: { color: dorado, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: 30 },
  title: { color: '#FFF', fontSize: 33, fontWeight: '700', marginTop: 12 },
  subtitle: { color: '#D6E1D9', marginTop: 11, lineHeight: 22 },
  body: { padding: 23 },
  demo: { backgroundColor: '#EFE6D2', color: '#896E3A', borderRadius: 8, padding: 12, overflow: 'hidden', textAlign: 'center', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 22, borderColor: '#E7E1D5', borderWidth: 1, marginTop: 20 },
  small: { color: '#9C7F46', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  heading: { color: verde, fontWeight: '700', fontSize: 19, marginTop: 10 },
  details: { color: '#65756C', marginTop: 9, fontSize: 13, lineHeight: 19 },
  section: { color: '#987D4D', fontSize: 11, letterSpacing: 1.5, fontWeight: '700', marginTop: 29, marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  option: { width: '31%', minHeight: 54, justifyContent: 'center', alignItems: 'center', padding: 7, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E7E1D5', borderRadius: 10 },
  selected: { backgroundColor: verde, borderColor: verde },
  optionText: { color: verde, fontWeight: '600', fontSize: 12, textAlign: 'center' },
  selectedText: { color: '#FFF' },
  button: { backgroundColor: verde, borderRadius: 13, alignItems: 'center', padding: 20, marginTop: 30 },
  dim: { opacity: 0.5 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  footer: { color: '#9BAA9D', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginTop: 35 },
});
