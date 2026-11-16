import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { actualizarPacienteDemo, leerPacienteDemo } from '@/lib/paciente-demo';

const verde = '#173D32';
const dorado = '#C6A76A';
const marfil = '#F8F5ED';

export default function Acceso() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    leerPacienteDemo().then((p) => {
      if (activo) setNombre(p.nombre === 'Paciente VITALIA' ? '' : p.nombre);
    }).catch(() => {}).finally(() => { if (activo) setListo(true); });
    return () => { activo = false; };
  }, []);

  async function entrar() {
    if (nombre.trim().length < 2) {
      Alert.alert('Nombre requerido', 'Escribe un nombre ficticio para la demostración.');
      return;
    }
    try {
      setGuardando(true);
      await actualizarPacienteDemo({ nombre: nombre.trim() });
      router.replace('/paciente');
    } catch {
      Alert.alert('Error', 'No fue posible abrir el portal.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.top}>
          <Text style={s.logo}>✚ VITALIA</Text>
          <Text style={s.micro}>ATENCIÓN QUE TE ACOMPAÑA</Text>
          <Text style={s.title}>Bienvenido a una nueva experiencia de salud.</Text>
          <Text style={s.subtitle}>
            Gestiona consultas, explora especialidades y lleva el control de tus citas.
          </Text>
        </View>
        <View style={s.card}>
          <Text style={s.banner}>ACCESO DE DEMOSTRACIÓN</Text>
          <Text style={s.cardTitle}>Portal del paciente</Text>
          <Text style={s.body}>
            Para esta versión utilizamos un perfil ficticio local. No hay inicio de sesión real ni contraseñas.
          </Text>
          <Text style={s.label}>Nombre de demostración</Text>
          <TextInput
            style={s.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej. Paciente Demo"
            placeholderTextColor="#8D9B91"
            autoCapitalize="words"
          />
          <Pressable style={[s.button, (guardando || !listo) && s.dim]} onPress={entrar} disabled={guardando || !listo}>
            {guardando || !listo
              ? <ActivityIndicator color={marfil} />
              : <Text style={s.buttonText}>Entrar a VITALIA  →</Text>}
          </Pressable>
          <Text style={s.note}>No introduzcas nombres, pólizas ni información médica reales.</Text>
        </View>
        <Text style={s.footer}>VITALIA · CUIDAMOS DE TI</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: verde },
  page: { flexGrow: 1, backgroundColor: marfil },
  top: { backgroundColor: verde, paddingHorizontal: 29, paddingTop: 40, paddingBottom: 65 },
  logo: { color: '#FFF', fontSize: 27, fontWeight: '800', letterSpacing: 3 },
  micro: { color: dorado, marginTop: 37, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#FFF', fontSize: 32, fontWeight: '700', lineHeight: 40, marginTop: 15 },
  subtitle: { color: '#D6E1D9', lineHeight: 23, marginTop: 17, fontSize: 14 },
  card: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: -25, padding: 24, borderRadius: 20, borderColor: '#E8E1D6', borderWidth: 1 },
  banner: { color: '#9C7F46', fontSize: 10, letterSpacing: 1.6, fontWeight: '700' },
  cardTitle: { color: verde, fontSize: 25, fontWeight: '700', marginTop: 16 },
  body: { color: '#65746B', lineHeight: 22, marginTop: 11, fontSize: 13 },
  label: { color: verde, fontWeight: '700', fontSize: 13, marginTop: 27, marginBottom: 9 },
  input: { backgroundColor: marfil, borderWidth: 1, borderColor: '#E1DED4', borderRadius: 10, color: verde, padding: 16 },
  button: { backgroundColor: verde, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 19 },
  dim: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  note: { color: '#7A857D', fontSize: 11, lineHeight: 18, marginTop: 20 },
  footer: { color: '#87958D', fontSize: 10, textAlign: 'center', letterSpacing: 2, marginVertical: 32 },
});
