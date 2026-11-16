import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  cancelarCitaDemo,
  obtenerCitasDemo,
  type CitaDemo,
} from '@/lib/citas-demo';

const C = {
  verde: '#173D32',
  dorado: '#C6A76A',
  marfil: '#F8F5ED',
  blanco: '#FFFFFF',
  gris: '#718079',
  borde: '#E7E1D5',
};

export default function MisCitasScreen() {
  const router = useRouter();

  const [citas, setCitas] = useState<CitaDemo[]>([]);
  const [cargando, setCargando] = useState(true);

  const actualizar = useCallback(async () => {
    const resultado = await obtenerCitasDemo();
    setCitas(resultado);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargar() {
        setCargando(true);

        try {
          const resultado = await obtenerCitasDemo();

          if (activo) {
            setCitas(resultado);
          }
        } catch {
          if (activo) {
            Alert.alert(
              'Error',
              'No se pudieron cargar las citas de demostración.'
            );
          }
        } finally {
          if (activo) {
            setCargando(false);
          }
        }
      }

      void cargar();

      return () => {
        activo = false;
      };
    }, [])
  );

  function confirmarCancelacion(id: string) {
    Alert.alert(
      'Cancelar cita',
      '¿Deseas cancelar esta cita de demostración?',
      [
        {
          text: 'Volver',
          style: 'cancel',
        },
        {
          text: 'Cancelar cita',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarCitaDemo(id);
              await actualizar();
            } catch {
              Alert.alert(
                'Error',
                'No fue posible actualizar la cita.'
              );
            }
          },
        },
      ]
    );
  }

  function formatearFecha(fecha: string) {
    const [ano, mes, dia] = fecha.split('-').map(Number);

    const fechaLocal = new Date(
      ano,
      mes - 1,
      dia,
      12
    );

    return fechaLocal.toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace('/paciente')}
            accessibilityRole="button"
          >
            <Text style={styles.back}>
              ‹ Inicio
            </Text>
          </Pressable>

          <Text style={styles.brand}>
            ✚ VITALIA
          </Text>

          <Text style={styles.eyebrow}>
            PORTAL DEL PACIENTE
          </Text>

          <Text style={styles.title}>
            Mis citas
          </Text>

          <Text style={styles.subtitle}>
            Consulta y administra tus citas
            de demostración.
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>
              DEMOSTRACIÓN · GUARDADO LOCAL
            </Text>
          </View>

          {cargando ? (
            <ActivityIndicator
              size="large"
              color={C.verde}
              style={styles.loading}
            />
          ) : citas.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>
                ♡
              </Text>

              <Text style={styles.emptyTitle}>
                Aún no tienes citas
              </Text>

              <Text style={styles.emptyDescription}>
                Comienza seleccionando tu hospital,
                especialidad y médico.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                HISTORIAL DE CITAS
              </Text>

              {citas.map((cita) => {
                const cancelada =
                  cita.estado === 'cancelada';

                return (
                  <View
                    key={cita.id}
                    style={styles.card}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>
                        {cita.especialidad}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          cancelada &&
                            styles.cancelledBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            cancelada &&
                              styles.cancelledText,
                          ]}
                        >
                          {cancelada
                            ? 'Cancelada'
                            : 'Programada'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.doctor}>
                      {cita.medico}
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.detail}>
                      CENTRO MÉDICO
                    </Text>

                    <Text style={styles.detailValue}>
                      {cita.hospital}
                    </Text>

                    <Text style={styles.detail}>
                      UBICACIÓN
                    </Text>

                    <Text style={styles.detailValue}>
                      {cita.ciudad}
                    </Text>

                    <Text style={styles.detail}>
                      FECHA Y HORA
                    </Text>

                    <Text style={styles.detailValue}>
                      {formatearFecha(cita.fecha)}
                      {' · '}
                      {cita.hora}
                    </Text>

                    {!cancelada && (
                <Pressable
                  style={{ backgroundColor: C.verde, borderRadius: 10, paddingVertical: 13, marginTop: 7, alignItems: 'center' }}
                  onPress={() => router.push({ pathname: '/reprogramar', params: { id: cita.id } })}
                  accessibilityRole="button"
                >
                  <Text style={{ color: C.blanco, fontWeight: '700', fontSize: 13 }}>Reprogramar cita</Text>
                </Pressable>
              )}
              {!cancelada && (
                      <Pressable
                        style={styles.cancelButton}
                        onPress={() =>
                          confirmarCancelacion(cita.id)
                        }
                        accessibilityRole="button"
                      >
                        <Text style={styles.cancelText}>
                          Cancelar cita
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </>
          )}

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace('/ciudades')}
            accessibilityRole="button"
          >
            <Text style={styles.primaryText}>
              Agendar otra cita
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>

          <Text style={styles.footer}>
            VITALIA · CUIDAMOS DE TI
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingTop: 24,
    paddingBottom: 38,
  },
  back: {
    color: C.marfil,
    fontSize: 15,
    marginBottom: 30,
  },
  brand: {
    color: C.marfil,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
  },
  eyebrow: {
    color: C.dorado,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 37,
  },
  title: {
    color: C.marfil,
    fontSize: 36,
    fontWeight: '700',
    marginTop: 13,
  },
  subtitle: {
    color: '#D6E1D9',
    fontSize: 14,
    lineHeight: 23,
    marginTop: 12,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 35,
  },
  demoBanner: {
    backgroundColor: '#EFE6D2',
    borderRadius: 9,
    padding: 12,
    marginBottom: 25,
  },
  demoBannerText: {
    color: '#876D3E',
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
  },
  loading: {
    marginTop: 50,
  },
  sectionTitle: {
    color: '#987D4D',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 18,
  },
  card: {
    backgroundColor: C.blanco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.borde,
    padding: 20,
    marginBottom: 17,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    color: C.verde,
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F2E7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cancelledBadge: {
    backgroundColor: '#F7E7E4',
  },
  statusText: {
    color: C.verde,
    fontSize: 11,
    fontWeight: '700',
  },
  cancelledText: {
    color: '#A44E48',
  },
  doctor: {
    color: C.gris,
    fontSize: 13,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: C.borde,
    marginVertical: 19,
  },
  detail: {
    color: '#99815A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    color: C.verde,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 15,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#D9AAA3',
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 7,
    alignItems: 'center',
  },
  cancelText: {
    color: '#A44E48',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: C.blanco,
    borderRadius: 16,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.borde,
  },
  emptyIcon: {
    fontSize: 42,
    color: C.dorado,
  },
  emptyTitle: {
    color: C.verde,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyDescription: {
    color: C.gris,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: C.verde,
    borderRadius: 13,
    padding: 19,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryText: {
    color: C.blanco,
    fontSize: 15,
    fontWeight: '700',
  },
  arrow: {
    color: C.dorado,
    fontSize: 22,
  },
  footer: {
    color: '#9AA99E',
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 28,
  },
});
