import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { obtenerPerfil, cerrarSesion } from '@/lib/vitalia-api';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  verde: '#173D32',
  profundo: '#102D26',
  dorado: '#C6A76A',
  marfil: '#F8F5ED',
  blanco: '#FFFFFF',
  gris: '#718079',
  borde: '#E7E1D5',
  suave: '#ECF2EC',
};

type Seccion =
  | 'inicio'
  | 'perfil'
  | 'seguro'
  | 'notificaciones';

export default function PacienteScreen() {
  const router = useRouter();

  const [seccion, setSeccion] = useState<Seccion>('inicio');
  const [nombre, setNombre] = useState('Paciente VITALIA');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [asegurado, setAsegurado] = useState<boolean | null>(null);
  const [aseguradora, setAseguradora] = useState('');
  const [poliza, setPoliza] = useState('');

  useFocusEffect(useCallback(() => {
    let activo = true;
    obtenerPerfil().then((p) => { if (activo) setNombre(p.nombre); }).catch(() => {});
    return () => { activo = false; };
  }, []));

  const titulos: Record<Seccion, string> = {
    inicio: 'Tu salud, en buenas manos.',
    perfil: 'Mi perfil',
    seguro: 'Mi seguro médico',
    notificaciones: 'Notificaciones',
  };

  function guardarDemo() {
    Alert.alert(
      'Demostración',
      'Ve al panel de perfil para guardar tus datos en el servidor.'
    );
  }

  function abrirCitas() {
    router.push('/mis-citas');
  }

  function abrirAgendamiento() {
    router.push('/ciudades');
  }

  function opcion(
    titulo: string,
    descripcion: string,
    simbolo: string,
    accion: () => void
  ) {
    return (
      <Pressable
        style={styles.option}
        onPress={accion}
        accessibilityRole="button"
        key={titulo}
      >
        <View style={styles.optionIcon}>
          <Text style={styles.optionSymbol}>{simbolo}</Text>
        </View>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{titulo}</Text>
          <Text style={styles.optionDescription}>
            {descripcion}
          </Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.brand}>✚ VITALIA</Text>

            <Pressable
              onPress={() => router.push({ pathname: '/panel', params: { vista: 'notificaciones' } })}
              accessibilityRole="button"
              accessibilityLabel="Ver notificaciones"
            >
              <Text style={styles.headerIcon}>♧</Text>
            </Pressable>
          </View>

          <Text style={styles.eyebrow}>
            PORTAL DEL PACIENTE
          </Text>

          <Text style={styles.headerTitle}>
            {titulos[seccion]}
          </Text>

          <Text style={styles.headerSubtitle}>
            {seccion === 'inicio'
              ? `Bienvenido, ${nombre}.`
              : 'Tu experiencia de atención médica.'}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.demo}>
            <Text style={styles.demoText}>
              VITALIA · CONECTADO AL SERVIDOR
            </Text>
          </View>

          {seccion === 'inicio' && (
            <>
              <View style={styles.hero}>
                <Text style={styles.heroEyebrow}>
                  TU BIENESTAR ES NUESTRA PRIORIDAD
                </Text>

                <Text style={styles.heroTitle}>
                  Tu próxima consulta comienza aquí.
                </Text>

                <Text style={styles.heroDescription}>
                  Encuentra especialistas y organiza
                  tus citas desde un solo lugar.
                </Text>

                <Pressable
                  style={styles.heroButton}
                  onPress={abrirAgendamiento}
                  accessibilityRole="button"
                >
                  <Text style={styles.heroButtonText}>
                    Agendar una cita →
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.sectionTitle}>
                ACCESOS RÁPIDOS
              </Text>

              {opcion(
                'Mis citas',
                'Consultar y cancelar citas',
                '▦',
                abrirCitas
              )}

              {opcion(
                'Mi perfil',
                'Información personal',
                '♙',
                () => router.push({ pathname: '/panel', params: { vista: 'perfil' } })
              )}

              {opcion(
                'Seguro médico',
                'Información de cobertura',
                '✚',
                () => router.push({ pathname: '/panel', params: { vista: 'seguro' } })
              )}

              {opcion(
                'Notificaciones',
                'Avisos de tu cuenta',
                '◉',
                () => router.push({ pathname: '/panel', params: { vista: 'notificaciones' } })
              )}
            </>
          )}

          {seccion === 'perfil' && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>
                INFORMACIÓN PERSONAL
              </Text>

              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre completo"
              />

              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                value={correo}
                onChangeText={setCorreo}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="809-000-0000"
                keyboardType="phone-pad"
              />

              <Pressable
                style={styles.primaryButton}
                onPress={guardarDemo}
              >
                <Text style={styles.primaryText}>
                  Revisar información
                </Text>
              </Pressable>
            </View>
          )}

          {seccion === 'seguro' && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>
                INFORMACIÓN DEL SEGURO
              </Text>

              <Text style={styles.label}>
                ¿Tienes seguro médico?
              </Text>

              <View style={styles.choiceRow}>
                {[
                  { texto: 'Sí', valor: true },
                  { texto: 'No', valor: false },
                ].map((item) => (
                  <Pressable
                    key={item.texto}
                    onPress={() => setAsegurado(item.valor)}
                    style={[
                      styles.choice,
                      asegurado === item.valor &&
                        styles.choiceSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        asegurado === item.valor &&
                          styles.choiceTextSelected,
                      ]}
                    >
                      {item.texto}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {asegurado === true && (
                <>
                  <Text style={styles.label}>
                    Aseguradora
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={aseguradora}
                    onChangeText={setAseguradora}
                    placeholder="Nombre de la aseguradora"
                  />

                  <Text style={styles.label}>
                    Número de póliza
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={poliza}
                    onChangeText={setPoliza}
                    placeholder="Número de póliza"
                  />
                </>
              )}

              <Pressable
                style={styles.primaryButton}
                onPress={guardarDemo}
              >
                <Text style={styles.primaryText}>
                  Revisar seguro
                </Text>
              </Pressable>

              <Text style={styles.note}>
                Esta información no verifica cobertura
                ni se transmite a una aseguradora.
              </Text>
            </View>
          )}

          {seccion === 'notificaciones' && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>
                CENTRO DE NOTIFICACIONES
              </Text>

              <Text style={styles.notificationTitle}>
                Bienvenido a VITALIA
              </Text>

              <Text style={styles.notificationText}>
                Tu portal de atención médica está listo
                para explorar sus funciones de demostración.
              </Text>

              <View style={styles.separator} />

              <Text style={styles.notificationTitle}>
                Agenda médica
              </Text>

              <Text style={styles.notificationText}>
                Consulta tus citas guardadas en la sección
                Mis citas.
              </Text>

              <Text style={styles.note}>
                Las notificaciones automáticas todavía
                no están habilitadas.
              </Text>
            </View>
          )}

          <Pressable onPress={async () => { await cerrarSesion(); router.replace('/acceso'); }} accessibilityRole="button" style={{ alignSelf: 'center', padding: 15 }}>
            <Text style={{ color: C.verde, fontWeight: '700' }}>Cerrar sesión</Text>
          </Pressable>
          <Text style={styles.footer}>
            VITALIA · CUIDAMOS DE TI
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { id: 'inicio', texto: 'Inicio', icono: '⌂' },
          { id: 'citas', texto: 'Citas', icono: '▦' },
          { id: 'seguro', texto: 'Seguro', icono: '✚' },
          { id: 'perfil', texto: 'Perfil', icono: '♙' },
        ].map((item) => {
          const activo = seccion === item.id;

          return (
            <Pressable
              key={item.id}
              style={styles.navItem}
              accessibilityRole="button"
              onPress={() => {
                if (item.id === 'citas') {
                  abrirCitas();
                } else {
                  if (item.id === 'inicio') { setSeccion('inicio'); } else { router.push({ pathname: '/panel', params: { vista: item.id } }); }
                }
              }}
            >
              <Text
                style={[
                  styles.navIcon,
                  activo && styles.navActive,
                ]}
              >
                {item.icono}
              </Text>

              <Text
                style={[
                  styles.navLabel,
                  activo && styles.navActive,
                ]}
              >
                {item.texto}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.verde,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: C.marfil,
  },
  header: {
    backgroundColor: C.verde,
    paddingHorizontal: 25,
    paddingTop: 22,
    paddingBottom: 38,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: C.blanco,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: 3,
  },
  headerIcon: {
    color: C.dorado,
    fontSize: 27,
  },
  eyebrow: {
    color: C.dorado,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 35,
  },
  headerTitle: {
    color: C.blanco,
    fontSize: 31,
    fontWeight: '700',
    lineHeight: 39,
    marginTop: 13,
  },
  headerSubtitle: {
    color: '#D6E1D9',
    fontSize: 14,
    marginTop: 10,
  },
  body: {
    flex: 1,
    padding: 23,
  },
  demo: {
    backgroundColor: '#EFE6D2',
    padding: 12,
    borderRadius: 9,
    marginBottom: 23,
  },
  demoText: {
    textAlign: 'center',
    color: '#876D3E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hero: {
    backgroundColor: C.verde,
    borderRadius: 18,
    padding: 24,
    marginBottom: 31,
  },
  heroEyebrow: {
    color: C.dorado,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: C.blanco,
    fontSize: 25,
    lineHeight: 33,
    fontWeight: '700',
    marginTop: 17,
  },
  heroDescription: {
    color: '#D6E1D9',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 13,
  },
  heroButton: {
    backgroundColor: C.dorado,
    padding: 15,
    borderRadius: 10,
    marginTop: 24,
    alignItems: 'center',
  },
  heroButtonText: {
    color: C.profundo,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#987D4D',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 17,
  },
  option: {
    backgroundColor: C.blanco,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.borde,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 44,
    height: 44,
    backgroundColor: C.suave,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSymbol: {
    color: C.verde,
    fontSize: 23,
  },
  optionContent: {
    flex: 1,
    marginLeft: 13,
  },
  optionTitle: {
    color: C.verde,
    fontSize: 15,
    fontWeight: '700',
  },
  optionDescription: {
    color: C.gris,
    fontSize: 12,
    marginTop: 5,
  },
  chevron: {
    color: C.dorado,
    fontSize: 28,
  },
  card: {
    backgroundColor: C.blanco,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: C.borde,
  },
  cardHeading: {
    color: '#987D4D',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 23,
  },
  label: {
    color: C.verde,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 9,
  },
  input: {
    borderWidth: 1,
    borderColor: C.borde,
    borderRadius: 10,
    backgroundColor: C.marfil,
    padding: 15,
    fontSize: 14,
    color: C.verde,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: C.verde,
    borderRadius: 10,
    padding: 17,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryText: {
    color: C.blanco,
    fontSize: 14,
    fontWeight: '700',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 23,
  },
  choice: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.borde,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  choiceSelected: {
    backgroundColor: C.verde,
    borderColor: C.verde,
  },
  choiceText: {
    color: C.verde,
    fontWeight: '700',
  },
  choiceTextSelected: {
    color: C.blanco,
  },
  notificationTitle: {
    color: C.verde,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  notificationText: {
    color: C.gris,
    fontSize: 13,
    lineHeight: 21,
  },
  separator: {
    height: 1,
    backgroundColor: C.borde,
    marginVertical: 20,
  },
  note: {
    color: C.gris,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 18,
  },
  footer: {
    color: '#9AA99E',
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 30,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: C.blanco,
    borderTopWidth: 1,
    borderTopColor: C.borde,
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIcon: {
    color: C.gris,
    fontSize: 23,
  },
  navLabel: {
    color: C.gris,
    fontSize: 11,
    fontWeight: '600',
  },
  navActive: {
    color: C.verde,
    fontWeight: '700',
  },
});
