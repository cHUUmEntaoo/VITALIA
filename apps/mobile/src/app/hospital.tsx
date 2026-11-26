
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Alert } from 'react-native';
import { crearCita, obtenerDisponibilidad, obtenerEspecialidades, obtenerHospitales, obtenerMedicos } from '@/lib/vitalia-api';
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

type Paso =
  | 'hospital'
  | 'especialidad'
  | 'medico'
  | 'fecha'
  | 'confirmacion';

const pasos: Paso[] = [
  'hospital',
  'especialidad',
  'medico',
  'fecha',
  'confirmacion',
];

type Item = { id: string; nombre: string; detalle: string };
type MedicoItem = Item & { especialidad: string; fotoUrl: string | null };

const titulos: Record<Paso, string> = {
  hospital: 'Elige tu centro médico.',
  especialidad: '¿Qué especialidad necesitas?',
  medico: 'Elige tu especialista.',
  fecha: 'Encuentra tu momento ideal.',
  confirmacion: 'Resumen de tu cita.',
};

const descripciones: Record<Paso, string> = {
  hospital: 'Selecciona dónde deseas recibir atención.',
  especialidad: 'Te ayudamos a encontrar la atención adecuada.',
  medico: 'Conoce a los profesionales disponibles.',
  fecha: 'Selecciona un horario disponible en VITALIA.',
  confirmacion: 'Revisa la cita antes de confirmarla en el servidor.',
};

function obtenerFechas() {
  return Array.from({ length: 21 }, (_, indice) => {
    const fecha = new Date();
    fecha.setHours(12, 0, 0, 0);
    fecha.setDate(fecha.getDate() + indice + 1);

    const ano = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return {
      valor: `${ano}-${mes}-${dia}`,
      semana: fecha.toLocaleDateString('es-DO', {
        weekday: 'short',
      }),
      numero: dia,
      mes: fecha.toLocaleDateString('es-DO', {
        month: 'short',
      }),
      completa: fecha.toLocaleDateString('es-DO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  });
}

type TarjetaProps = {
  titulo: string;
  detalle: string;
  etiqueta?: string;
  seleccionada: boolean;
  fotoUrl?: string | null;
  onPress: () => void;
};

function Tarjeta({
  titulo,
  detalle,
  etiqueta,
  seleccionada,
  fotoUrl,
  onPress,
}: TarjetaProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: seleccionada }}
      style={[
        styles.card,
        seleccionada && styles.cardSelected,
      ]}
    >
      {fotoUrl ? (
        <Image source={{ uri: fotoUrl }} style={{ width: 46, height: 46, borderRadius: 23, marginRight: 8 }} />
      ) : (
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>✚</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{titulo}</Text>
        <Text style={styles.cardDescription}>{detalle}</Text>
        {etiqueta && (
          <Text style={styles.cardTag}>{etiqueta}</Text>
        )}
      </View>

      <View
        style={[
          styles.radio,
          seleccionada && styles.radioSelected,
        ]}
      >
        {seleccionada && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

export default function HospitalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ciudad?: string }>();

  const ciudad =
    typeof params.ciudad === 'string'
      ? params.ciudad
      : 'Santo Domingo';

  const [paso, setPaso] = useState<Paso>('hospital');
  const [guardando, setGuardando] = useState(false);
  const [hospitales, setHospitales] = useState<Item[]>([]);
  const [especialidades, setEspecialidades] = useState<Item[]>([]);
  const [medicos, setMedicos] = useState<MedicoItem[]>([]);
  const [horarios, setHorarios] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [hospital, setHospital] = useState<string | null>(null);
  const [especialidad, setEspecialidad] = useState<string | null>(null);
  const [medico, setMedico] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    Promise.all([obtenerHospitales(), obtenerEspecialidades()])
      .then(([listaHospitales, listaEspecialidades]) => {
        if (!activo) return;
        setHospitales(listaHospitales.filter(h => h.ciudad === ciudad).map(h => ({ id: String(h.id), nombre: h.nombre, detalle: h.ciudad })));
        setEspecialidades(listaEspecialidades.filter(e => e.activa).map(e => ({ id: String(e.id), nombre: e.nombre, detalle: e.descripcion })));
        setErrorCarga('');
      })
      .catch(e => { if (activo) setErrorCarga(e instanceof Error ? e.message : 'No pudimos cargar los catálogos.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [ciudad]);

  useEffect(() => {
    let activo = true;
    setMedicos([]);
    if (hospital && especialidad) {
      obtenerMedicos(Number(hospital), Number(especialidad))
        .then(lista => { if (activo) setMedicos(lista.map(m => ({ id: String(m.id), nombre: `${m.nombre} ${m.apellido}`, detalle: m.numeroExequatur ? `Exequátur: ${m.numeroExequatur}` : 'Profesional médico', especialidad, fotoUrl: m.fotoUrl }))); })
        .catch(e => { if (activo) Alert.alert('No se pudieron cargar los médicos', e instanceof Error ? e.message : 'Error de conexión'); });
    }
    return () => { activo = false; };
  }, [hospital, especialidad]);

  useEffect(() => {
    let activo = true;
    setHorarios([]);
    if (medico && hospital && fecha) {
      obtenerDisponibilidad(Number(medico), Number(hospital), fecha)
        .then(lista => { if (activo) setHorarios(lista); })
        .catch(e => { if (activo) Alert.alert('Disponibilidad', e instanceof Error ? e.message : 'Error de conexión'); });
    }
    return () => { activo = false; };
  }, [medico, hospital, fecha]);

  const fechas = obtenerFechas();

  const hospitalActual = hospitales.find(
    (item) => item.id === hospital
  );

  const especialidadActual = especialidades.find(
    (item) => item.id === especialidad
  );

  const medicoActual = medicos.find(
    (item) => item.id === medico
  );

  const fechaActual = fechas.find(
    (item) => item.valor === fecha
  );

  const medicosDisponibles = medicos;

  const indicePaso = pasos.indexOf(paso);

  const puedeAvanzar =
    paso === 'hospital'
      ? hospital !== null
      : paso === 'especialidad'
        ? especialidad !== null
        : paso === 'medico'
          ? medico !== null
          : paso === 'fecha'
            ? fecha !== null && hora !== null && horarios.includes(hora)
            : true;

  function retroceder() {
    if (paso === 'hospital') {
      router.back();
      return;
    }

    setPaso(pasos[indicePaso - 1]);
  }


async function avanzar() {
  if (!puedeAvanzar || guardando) return;

  if (paso === 'confirmacion') {
    if (
      !hospitalActual ||
      !especialidadActual ||
      !medicoActual ||
      !fecha ||
      !hora
    ) {
      Alert.alert(
        'Datos incompletos',
        'Debes completar la selección antes de confirmar.'
      );
      return;
    }

    setGuardando(true);

    try {
      await crearCita(Number(medico), Number(hospital), Number(especialidad), fecha, hora);

      router.replace('/mis-citas');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No fue posible confirmar la cita.'
      );
    } finally {
      setGuardando(false);
    }

    return;
  }

  setPaso(pasos[indicePaso + 1]);
}



function cambiarHospital(id: string) {
  setHospital(id);
  setEspecialidad(null);
  setMedico(null);
  setFecha(null);
  setHora(null);

  // Avanzar automáticamente a las especialidades médicas.
  setPaso('especialidad');
}


  function cambiarEspecialidad(id: string) {
    setEspecialidad(id);
    setMedico(null);
    setFecha(null);
    setHora(null);
  }

  function cambiarMedico(id: string) {
    setMedico(id);
    setFecha(null);
    setHora(null);
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              onPress={retroceder}
              accessibilityRole="button"
              accessibilityLabel="Volver al paso anterior"
            >
              <Text style={styles.back}>‹ Volver</Text>
            </Pressable>

            <Text style={styles.brand}>✚ VITALIA</Text>
          </View>

          <View style={styles.progressRow}>
            {pasos.map((item, indice) => (
              <View
                key={item}
                style={[
                  styles.progressSegment,
                  indice <= indicePaso &&
                    styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.step}>
            PASO {String(indicePaso + 1).padStart(2, '0')} DE 05
          </Text>

          <Text style={styles.headerTitle}>
            {titulos[paso]}
          </Text>

          <Text style={styles.headerDescription}>
            {descripciones[paso]}
          </Text>

          <View style={styles.cityBadge}>
            <Text style={styles.cityBadgeText}>
              ◉ {ciudad}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {cargando && <Text style={{ color: C.verde, marginBottom: 12 }}>Cargando hospitales y especialidades...</Text>}
          {!!errorCarga && <Text style={{ color: '#A44E48', marginBottom: 12 }}>{errorCarga}</Text>}
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>
              VITALIA · AGENDAMIENTO EN EL SERVIDOR
            </Text>
          </View>

          {paso === 'hospital' && (
            <>
              <Text style={styles.sectionTitle}>
                CENTROS MÉDICOS
              </Text>

              {hospitales.length === 0 && !cargando && <Text style={styles.helper}>No hay hospitales disponibles en esta ciudad.</Text>}
              {hospitales.map((item) => (
                <Tarjeta
                  key={item.id}
                  titulo={item.nombre}
                  detalle={item.detalle}
                  etiqueta={ciudad}
                  seleccionada={hospital === item.id}
                  onPress={() => cambiarHospital(item.id)}
                />
              ))}
            </>
          )}

          {paso === 'especialidad' && (
            <>
              <Text style={styles.sectionTitle}>
                ESPECIALIDADES DISPONIBLES
              </Text>

              {especialidades.map((item) => (
                <Tarjeta
                  key={item.id}
                  titulo={item.nombre}
                  detalle={item.detalle}
                  seleccionada={especialidad === item.id}
                  onPress={() => cambiarEspecialidad(item.id)}
                />
              ))}
            </>
          )}

          {paso === 'medico' && (
            <>
              <Text style={styles.sectionTitle}>
                PROFESIONALES DISPONIBLES
              </Text>

              {medicosDisponibles.length === 0 && <Text style={styles.helper}>No hay médicos registrados para esta combinación. Administración debe cargar los profesionales aprobados.</Text>}
              {medicosDisponibles.map((item) => (
                <Tarjeta
                  key={item.id}
                  titulo={item.nombre}
                  detalle={item.detalle}
                  etiqueta={especialidadActual?.nombre}
                  fotoUrl={item.fotoUrl}
                  seleccionada={medico === item.id}
                  onPress={() => cambiarMedico(item.id)}
                />
              ))}
            </>
          )}

          {paso === 'fecha' && (
            <>
              <Text style={styles.sectionTitle}>
                SELECCIONA UNA FECHA
              </Text>

              <View style={styles.dateGrid}>
                {fechas.map((item) => (
                  <Pressable
                    key={item.valor}
                    onPress={() => { setFecha(item.valor); setHora(null); }}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: fecha === item.valor,
                    }}
                    style={[
                      styles.dateCard,
                      fecha === item.valor &&
                        styles.dateCardSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateWeekday,
                        fecha === item.valor &&
                          styles.dateTextSelected,
                      ]}
                    >
                      {item.semana}
                    </Text>

                    <Text
                      style={[
                        styles.dateNumber,
                        fecha === item.valor &&
                          styles.dateTextSelected,
                      ]}
                    >
                      {item.numero}
                    </Text>

                    <Text
                      style={[
                        styles.dateMonth,
                        fecha === item.valor &&
                          styles.dateTextSelected,
                      ]}
                    >
                      {item.mes}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionTitle}>
                SELECCIONA UN HORARIO
              </Text>

              {horarios.length === 0 && <Text style={styles.helper}>Selecciona una fecha con horarios disponibles. Si está vacía, no hay cupos para ese día.</Text>}
              <View style={styles.timeGrid}>
                {horarios.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setHora(item)}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: hora === item,
                    }}
                    style={[
                      styles.timeCard,
                      hora === item &&
                        styles.timeCardSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        hora === item &&
                          styles.timeTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.helper}>
                Los horarios mostrados se consultan en tiempo real
                con el servidor de VITALIA.
              </Text>
            </>
          )}

          {paso === 'confirmacion' && (
            <>
              <View style={styles.successIcon}>
                <Text style={styles.successCheck}>✓</Text>
              </View>

              <Text style={styles.successTitle}>
                ¡Tu selección está lista!
              </Text>

              <Text style={styles.successDescription}>
                Revisa los datos y confirma tu reserva.
                Se registrará en VITALIA al continuar.
              </Text>

              <View style={styles.summary}>
                <Text style={styles.summaryHeading}>
                  RESUMEN DE LA SELECCIÓN
                </Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ciudad</Text>
                  <Text style={styles.summaryValue}>
                    {ciudad}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Hospital</Text>
                  <Text style={styles.summaryValue}>
                    {hospitalActual?.nombre ?? '-'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Especialidad</Text>
                  <Text style={styles.summaryValue}>
                    {especialidadActual?.nombre ?? '-'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Médico</Text>
                  <Text style={styles.summaryValue}>
                    {medicoActual?.nombre ?? '-'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fecha</Text>
                  <Text style={styles.summaryValue}>
                    {fechaActual?.completa ?? fecha ?? '-'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Hora</Text>
                  <Text style={styles.summaryValue}>
                    {hora ?? '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Esta es una vista previa. No se ha
                  registrado ninguna cita ni enviado
                  información al servidor.
                </Text>
              </View>
            </>
          )}

          <Pressable
            onPress={avanzar}
            disabled={!puedeAvanzar || guardando}
            accessibilityRole="button"
            accessibilityState={{ disabled: !puedeAvanzar }}
            style={[
              styles.button,
              !puedeAvanzar && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {paso === 'confirmacion'
                ? 'Confirmar mi cita'
                : paso === 'fecha'
                  ? 'Revisar la cita'
                  : 'Continuar'}
            </Text>

            <Text style={styles.buttonArrow}>→</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: C.verde,
  },
  scroll: {
    flex: 1,
    backgroundColor: C.marfil,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: C.verde,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 35,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    color: C.marfil,
    fontSize: 15,
  },
  brand: {
    color: C.marfil,
    fontWeight: '700',
    fontSize: 19,
    letterSpacing: 2,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 32,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#426759',
    borderRadius: 3,
  },
  progressSegmentActive: {
    backgroundColor: C.dorado,
  },
  step: {
    color: C.dorado,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 13,
  },
  headerTitle: {
    color: C.marfil,
    fontSize: 31,
    lineHeight: 39,
    fontWeight: '700',
  },
  headerDescription: {
    color: '#D6E1D9',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  cityBadge: {
    backgroundColor: '#285346',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 9,
    alignSelf: 'flex-start',
    marginTop: 22,
  },
  cityBadgeText: {
    color: C.marfil,
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 24,
    paddingBottom: 35,
  },
  demoBanner: {
    backgroundColor: '#EFE6D2',
    padding: 11,
    borderRadius: 9,
    marginBottom: 25,
  },
  demoBannerText: {
    textAlign: 'center',
    color: '#876D3E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: '#947848',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 19,
  },
  card: {
    backgroundColor: C.blanco,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.borde,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: C.verde,
    backgroundColor: C.suave,
  },
  cardIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: C.suave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    color: C.verde,
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
    marginLeft: 13,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: C.verde,
    fontWeight: '700',
  },
  cardDescription: {
    color: C.gris,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  cardTag: {
    color: '#9A8050',
    fontSize: 11,
    marginTop: 7,
    fontWeight: '600',
  },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#B7C5BA',
    marginLeft: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: C.verde,
  },
  radioDot: {
    width: 9,
    height: 9,
    backgroundColor: C.verde,
    borderRadius: 5,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 33,
  },
  dateCard: {
    width: '30%',
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: C.blanco,
    borderWidth: 1,
    borderColor: C.borde,
  },
  dateCardSelected: {
    backgroundColor: C.verde,
    borderColor: C.verde,
  },
  dateWeekday: {
    color: C.gris,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  dateNumber: {
    color: C.verde,
    fontSize: 25,
    fontWeight: '700',
    marginTop: 4,
  },
  dateMonth: {
    color: C.gris,
    fontSize: 11,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  dateTextSelected: {
    color: C.marfil,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeCard: {
    width: '47%',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: C.blanco,
    borderWidth: 1,
    borderColor: C.borde,
  },
  timeCardSelected: {
    backgroundColor: C.verde,
    borderColor: C.verde,
  },
  timeText: {
    color: C.verde,
    fontSize: 13,
    fontWeight: '700',
  },
  timeTextSelected: {
    color: C.marfil,
  },
  helper: {
    color: C.gris,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 20,
  },
  successIcon: {
    alignSelf: 'center',
    backgroundColor: C.suave,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  successCheck: {
    color: C.verde,
    fontSize: 40,
    fontWeight: '700',
  },
  successTitle: {
    color: C.verde,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  successDescription: {
    color: C.gris,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  summary: {
    backgroundColor: C.blanco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.borde,
    padding: 20,
  },
  summaryHeading: {
    color: '#9B8050',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  summaryRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borde,
  },
  summaryLabel: {
    color: C.gris,
    fontSize: 12,
    marginBottom: 5,
  },
  summaryValue: {
    color: C.verde,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  warningBox: {
    backgroundColor: '#EFE6D2',
    borderRadius: 12,
    padding: 17,
    marginTop: 19,
  },
  warningText: {
    color: '#795F30',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: C.verde,
    borderRadius: 13,
    paddingHorizontal: 21,
    paddingVertical: 19,
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: C.blanco,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  buttonArrow: {
    color: C.dorado,
    fontSize: 22,
    marginLeft: 12,
  },
  footer: {
    textAlign: 'center',
    color: '#9AA99E',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 27,
  },
});
