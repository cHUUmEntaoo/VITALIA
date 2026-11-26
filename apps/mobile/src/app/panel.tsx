import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { guardarPerfil, obtenerPerfil, type PerfilPaciente } from '@/lib/vitalia-api';
import { obtenerCitasServidor, type CitaServidor } from '@/lib/citas-servidor';

type PacienteUi = { nombre: string; apellido: string; correo: string; telefono: string; asegurado: 'si' | 'no'; ars: string; afiliacion: string };
function desdeServidor(p: PerfilPaciente): PacienteUi {
  return { nombre: p.nombre, apellido: p.apellido, correo: p.correo ?? '', telefono: p.telefono ?? '', asegurado: p.tieneSeguro ? 'si' : 'no', ars: p.aseguradora ?? '', afiliacion: p.numeroAfiliacion ?? '' };
}

const verde = '#173D32';
const dorado = '#C6A76A';
const marfil = '#F8F5ED';
const aseguradoras = ['SeNaSa', 'ARS Humano', 'ARS Universal', 'MAPFRE Salud', 'Otra'];

export default function PanelPaciente() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vista?: string }>();
  const vista = params.vista === 'seguro' ? 'seguro' : params.vista === 'notificaciones' ? 'notificaciones' : 'perfil';
  const [datos, setDatos] = useState<PacienteUi | null>(null);
  const [citas, setCitas] = useState<CitaServidor[]>([]);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(useCallback(() => {
    let activo = true;
    Promise.all([obtenerPerfil(), obtenerCitasServidor()])
      .then(([perfil, agenda]) => { if (activo) { setDatos(desdeServidor(perfil)); setCitas(agenda); } })
      .catch(() => { if (activo) Alert.alert('Error', 'No se pudo consultar el servidor.'); });
    return () => { activo = false; };
  }, []));

  function modificar(campo: keyof PacienteUi, valor: string) {
    if (datos) setDatos({ ...datos, [campo]: valor });
  }

  async function guardar() {
    if (!datos) return;
    if (!datos.nombre.trim()) {
      Alert.alert('Nombre requerido', 'Completa tu nombre.');
      return;
    }
    try {
      setGuardando(true);
      const actualizado = await guardarPerfil({
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        telefono: datos.telefono,
        tieneSeguro: datos.asegurado === 'si',
        aseguradora: datos.asegurado === 'si' ? datos.ars : null,
        numeroAfiliacion: datos.asegurado === 'si' ? datos.afiliacion : null,
      });
      setDatos(desdeServidor(actualizado));
      Alert.alert('Cambios guardados', 'Tu información fue guardada en VITALIA.');
    } catch {
      Alert.alert('Error', 'No fue posible guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  }

  function campo(etiqueta: string, nombre: keyof PacienteUi, placeholder: string) {
    return (
      <View style={s.field} key={nombre}>
        <Text style={s.label}>{etiqueta}</Text>
        <TextInput
          style={s.input}
          value={datos?.[nombre] ?? ''}
          editable={nombre !== 'correo'}
          onChangeText={(valor) => modificar(nombre, valor)}
          placeholder={placeholder}
          placeholderTextColor="#96A097"
          autoCapitalize={nombre === 'correo' ? 'none' : 'sentences'}
          keyboardType={nombre === 'correo' ? 'email-address' : nombre === 'telefono' ? 'phone-pad' : 'default'}
        />
      </View>
    );
  }

  const titulo = vista === 'seguro' ? 'Mi seguro médico' : vista === 'notificaciones' ? 'Notificaciones' : 'Mi perfil';

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.top}>
          <Pressable onPress={() => router.replace('/paciente')}><Text style={s.back}>‹ Volver al portal</Text></Pressable>
          <Text style={s.brand}>✚ VITALIA</Text>
          <Text style={s.eyebrow}>PORTAL DEL PACIENTE</Text>
          <Text style={s.title}>{titulo}</Text>
          <Text style={s.subtitle}>Información del paciente almacenada en VITALIA.</Text>
        </View>
        <View style={s.content}>
          <Text style={s.banner}>VITALIA · PERFIL EN EL SERVIDOR</Text>
          {!datos ? <ActivityIndicator color={verde} style={{ marginTop: 35 }} /> : (
            <>
              {vista === 'perfil' && (
                <View style={s.card}>
                  <Text style={s.section}>INFORMACIÓN PERSONAL</Text>
                  {campo('Nombre', 'nombre', 'Nombre')}
                  {campo('Apellido', 'apellido', 'Apellido')}
                  {campo('Correo electrónico (solo lectura)', 'correo', 'correo@ejemplo.com')}
                  {campo('Teléfono', 'telefono', '809-000-0000')}
                  <Pressable style={s.button} onPress={guardar} disabled={guardando}>
                    <Text style={s.buttonText}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text>
                  </Pressable>
                </View>
              )}
              {vista === 'seguro' && (
                <View style={s.card}>
                  <Text style={s.section}>DATOS DEL SEGURO</Text>
                  <Text style={s.label}>¿Paciente asegurado?</Text>
                  <View style={s.row}>
                    {(['si','no'] as const).map((respuesta) => (
                      <Pressable key={respuesta} style={[s.choice, datos.asegurado === respuesta && s.chosen]}
                        onPress={() => modificar('asegurado', respuesta)}>
                        <Text style={[s.choiceText, datos.asegurado === respuesta && s.chosenText]}>
                          {respuesta === 'si' ? 'Sí' : 'No'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {datos.asegurado === 'si' && (
                    <>
                      <Text style={s.label}>Aseguradora</Text>
                      <View style={s.tags}>
                        {aseguradoras.map((ars) => (
                          <Pressable key={ars} style={[s.tag, datos.ars === ars && s.chosen]}
                            onPress={() => modificar('ars', ars)}>
                            <Text style={[s.tagText, datos.ars === ars && s.chosenText]}>{ars}</Text>
                          </Pressable>
                        ))}
                      </View>
                      {campo('Número de afiliación', 'afiliacion', '0000')}
                    </>
                  )}
                  <Pressable style={s.button} onPress={guardar} disabled={guardando}>
                    <Text style={s.buttonText}>{guardando ? 'Guardando...' : 'Guardar seguro'}</Text>
                  </Pressable>
                  <Text style={s.note}>No se comprueba cobertura ni conexión con aseguradoras.</Text>
                </View>
              )}
              {vista === 'notificaciones' && (
                <View style={s.card}>
                  <Text style={s.section}>AVISOS DENTRO DE LA APP</Text>
                  <Text style={s.itemTitle}>Bienvenido a VITALIA</Text>
                  <Text style={s.itemText}>Ya puedes consultar VITALIA en línea.</Text>
                  <View style={s.divider} />
                  <Text style={s.itemTitle}>Tus citas</Text>
                  <Text style={s.itemText}>
                    Tienes {citas.filter((c) => c.estado === 'programada').length} cita(s) programada(s) en VITALIA.
                  </Text>
                  {citas.slice(0, 5).map((c) => (
                    <View key={c.id} style={s.notice}>
                      <Text style={s.itemTitle}>{c.especialidad} · {c.estado}</Text>
                      <Text style={s.itemText}>{c.fecha} · {c.hora} · {c.hospital}</Text>
                    </View>
                  ))}
                  <Text style={s.note}>Son avisos dentro de la aplicación; todavía no hay notificaciones push.</Text>
                </View>
              )}
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
  top: { backgroundColor: verde, paddingHorizontal: 25, paddingTop: 22, paddingBottom: 38 },
  back: { color: marfil, fontSize: 14, marginBottom: 27 },
  brand: { color: '#FFF', fontSize: 22, fontWeight: '700', letterSpacing: 3 },
  eyebrow: { color: dorado, marginTop: 30, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#FFF', fontSize: 33, fontWeight: '700', marginTop: 12 },
  subtitle: { color: '#D6E1D9', fontSize: 13, lineHeight: 22, marginTop: 10 },
  content: { flex: 1, padding: 23 },
  banner: { backgroundColor: '#EFE6D2', color: '#896E3A', fontWeight: '700', padding: 13, overflow: 'hidden', borderRadius: 9, fontSize: 10, textAlign: 'center', letterSpacing: 1 },
  card: { backgroundColor: '#FFF', padding: 21, borderColor: '#E7E1D5', borderWidth: 1, borderRadius: 15, marginTop: 19 },
  section: { color: '#987D4D', fontWeight: '700', fontSize: 11, letterSpacing: 1.2, marginBottom: 22 },
  field: { marginBottom: 18 },
  label: { color: verde, fontWeight: '700', fontSize: 13, marginBottom: 10 },
  input: { color: verde, backgroundColor: marfil, padding: 15, borderRadius: 10, borderColor: '#E1DED4', borderWidth: 1, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  choice: { flex: 1, borderWidth: 1, borderColor: '#E1DED4', alignItems: 'center', padding: 15, borderRadius: 9 },
  choiceText: { color: verde, fontWeight: '700' },
  chosen: { backgroundColor: verde, borderColor: verde },
  chosenText: { color: '#FFF' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 20 },
  tag: { borderWidth: 1, borderColor: '#E1DED4', paddingVertical: 11, paddingHorizontal: 13, borderRadius: 12 },
  tagText: { color: verde, fontWeight: '600', fontSize: 12 },
  button: { backgroundColor: verde, borderRadius: 10, padding: 17, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  note: { color: '#78867B', fontSize: 11, lineHeight: 19, marginTop: 19 },
  itemTitle: { color: verde, fontWeight: '700', fontSize: 15, marginTop: 8 },
  itemText: { color: '#67756C', lineHeight: 21, marginTop: 7, fontSize: 13 },
  divider: { backgroundColor: '#E8E2D7', height: 1, marginVertical: 17 },
  notice: { borderTopWidth: 1, borderTopColor: '#E8E2D7', marginTop: 17, paddingTop: 13 },
  footer: { color: '#9BAA9D', fontSize: 10, textAlign: 'center', letterSpacing: 2, marginTop: 28 },
});
