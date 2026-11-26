import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { haySesion, iniciarSesion, registrarPaciente, obtenerPerfil } from '@/lib/vitalia-api';

const verde = '#173D32';
const dorado = '#C6A76A';
const marfil = '#F8F5ED';

export default function Acceso() {
  const router = useRouter();
  const [registro, setRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    async function verificar() {
      try {
        if (await haySesion()) {
          await obtenerPerfil();
          if (activo) router.replace('/paciente');
        }
      } catch { /* Token vencido o servidor sin conexión: permitir iniciar sesión. */ }
      finally { if (activo) setListo(true); }
    }
    void verificar();
    return () => { activo = false; };
  }, [router]);

  async function entrar() {
    if (!correo.trim() || !contrasena) {
      Alert.alert('Datos incompletos', 'Escribe tu correo electrónico y contraseña.');
      return;
    }
    if (registro && (nombre.trim().length < 2 || apellido.trim().length < 2)) {
      Alert.alert('Datos incompletos', 'Completa tu nombre y apellido.');
      return;
    }
    try {
      setGuardando(true);
      if (registro) await registrarPaciente(nombre.trim(), apellido.trim(), correo.trim(), contrasena);
      await iniciarSesion(correo.trim(), contrasena);
      router.replace('/paciente');
    } catch (e) {
      Alert.alert('No fue posible continuar', e instanceof Error ? e.message : 'Verifica tus datos e inténtalo nuevamente.');
    } finally { setGuardando(false); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.top}>
          <Text style={s.logo}>✚ VITALIA</Text>
          <Text style={s.micro}>ATENCIÓN QUE TE ACOMPAÑA</Text>
          <Text style={s.title}>Bienvenido a una nueva experiencia de salud.</Text>
          <Text style={s.subtitle}>Encuentra especialistas y gestiona tus citas con tu cuenta personal.</Text>
        </View>
        <View style={s.card}>
          <Text style={s.banner}>PORTAL DEL PACIENTE</Text>
          <Text style={s.cardTitle}>{registro ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
          <Text style={s.body}>{registro ? 'Regístrate para gestionar tus citas desde el celular.' : 'Accede con tu correo y contraseña de VITALIA.'}</Text>
          {registro && (
            <>
              <Text style={s.label}>Nombre</Text>
              <TextInput style={s.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" autoCapitalize="words" />
              <Text style={s.label}>Apellido</Text>
              <TextInput style={s.input} value={apellido} onChangeText={setApellido} placeholder="Apellido" autoCapitalize="words" />
            </>
          )}
          <Text style={s.label}>Correo electrónico</Text>
          <TextInput style={s.input} value={correo} onChangeText={setCorreo} placeholder="correo@ejemplo.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          <Text style={s.label}>Contraseña</Text>
          <TextInput style={s.input} value={contrasena} onChangeText={setContrasena} placeholder="Contraseña" secureTextEntry autoComplete={registro ? 'new-password' : 'current-password'} />
          {registro && <Text style={s.note}>Mínimo 12 caracteres, con mayúsculas, minúsculas, números y símbolos.</Text>}
          <Pressable style={[s.button, (guardando || !listo) && s.dim]} onPress={entrar} disabled={guardando || !listo}>
            {guardando || !listo ? <ActivityIndicator color={marfil} /> : <Text style={s.buttonText}>{registro ? 'Crear mi cuenta  →' : 'Entrar a VITALIA  →'}</Text>}
          </Pressable>
          <Pressable onPress={() => { setRegistro(!registro); setContrasena(''); }} style={s.switchButton}>
            <Text style={s.switchText}>{registro ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Regístrate'}</Text>
          </Pressable>
          <Text style={s.note}>Entorno universitario de pruebas. No introduzcas información médica real.</Text>
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
  label: { color: verde, fontWeight: '700', fontSize: 13, marginTop: 21, marginBottom: 9 },
  input: { backgroundColor: marfil, borderWidth: 1, borderColor: '#E1DED4', borderRadius: 10, color: verde, padding: 15 },
  button: { backgroundColor: verde, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 22 },
  dim: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  note: { color: '#7A857D', fontSize: 11, lineHeight: 18, marginTop: 18 },
  switchButton: { alignSelf: 'center', paddingVertical: 18 },
  switchText: { color: verde, fontSize: 13, fontWeight: '700' },
  footer: { color: '#87958D', fontSize: 10, textAlign: 'center', letterSpacing: 2, marginVertical: 32 },
});
