import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colores = {
  verde: '#173D32',
  verdeProfundo: '#102D26',
  dorado: '#C6A76A',
  marfil: '#F8F5ED',
  blanco: '#FFFFFF',
  gris: '#718079',
  borde: '#E7E1D5',
};

const ubicaciones = [
  {
    nombre: 'Santo Domingo',
    descripcion: 'Centros médicos en Santo Domingo',
  },
  {
    nombre: 'Santiago',
    descripcion: 'Centros médicos en Santiago',
  },
  {
    nombre: 'Bávaro',
    descripcion: 'Centros médicos en Bávaro',
  },
];


export default function HomeScreen() {
  const router = useRouter();

  const [pantalla, setPantalla] = useState<'inicio' | 'ubicaciones'>(
    'inicio'
  );

  const [ubicacion, setUbicacion] = useState<string | null>(null);

  function continuar() {
    if (!ubicacion) {
      Alert.alert(
        'Selecciona una ubicación',
        'Elige dónde deseas recibir atención médica.'
      );
      return;
    }

    router.push({
      pathname: '/hospital',
      params: { ciudad: ubicacion },
    });
  }


  if (pantalla === 'ubicaciones') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="light-content"
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.locationHeader}>
            <Pressable
              onPress={() => setPantalla('inicio')}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Volver a la bienvenida"
            >
              <Text style={styles.backText}>‹ Volver</Text>
            </Pressable>

            <View style={styles.brandRow}>
              <View style={styles.logoSmall}>
                <Text style={styles.logoSymbol}>✚</Text>
              </View>
              <Text style={styles.brandName}>VITALIA</Text>
            </View>

            <Text style={styles.locationEyebrow}>
              PASO 01 · TU UBICACIÓN
            </Text>

            <Text style={styles.locationTitle}>
              ¿Dónde deseas recibir atención?
            </Text>

            <Text style={styles.locationSubtitle}>
              Selecciona la ciudad donde deseas buscar un
              centro médico.
            </Text>
          </View>

          <View style={styles.locationBody}>
            <Text style={styles.sectionLabel}>
              UBICACIONES DISPONIBLES
            </Text>

            {ubicaciones.map((item) => {
              const seleccionado = ubicacion === item.nombre;

              return (
                <Pressable
                  key={item.nombre}
                  onPress={() => setUbicacion(item.nombre)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: seleccionado }}
                  style={[
                    styles.locationCard,
                    seleccionado && styles.locationCardSelected,
                  ]}
                >
                  <View style={styles.locationCardContent}>
                    <Text style={styles.locationCardTitle}>
                      {item.nombre}
                    </Text>

                    <Text style={styles.locationCardDescription}>
                      {item.descripcion}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      seleccionado && styles.radioSelected,
                    ]}
                  >
                    {seleccionado && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              style={styles.primaryButton}
              onPress={continuar}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                Continuar
              </Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </Pressable>

            <Text style={styles.helperText}>
              Próximamente podrás consultar los hospitales,
              especialidades médicas y horarios disponibles.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View style={styles.logoSmall}>
              <Text style={styles.logoSymbol}>✚</Text>
            </View>

            <Text style={styles.brandName}>VITALIA</Text>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>
              TU BIENESTAR ES NUESTRA PRIORIDAD
            </Text>

            <Text style={styles.heroTitle}>
              Tu salud,{'\n'}
              <Text style={styles.heroTitleAccent}>
                en buenas manos.
              </Text>
            </Text>

            <Text style={styles.heroDescription}>
              Una experiencia más humana, sencilla y
              conectada para cuidar de ti y de quienes más
              quieres.
            </Text>
          </View>

          <View style={styles.heroArtwork}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Text style={styles.heroCross}>✚</Text>
              </View>
            </View>

            <View style={styles.floatingCard}>
              <View style={styles.floatingIcon}>
                <Text style={styles.floatingCheck}>✓</Text>
              </View>
              <View>
                <Text style={styles.floatingTitle}>
                  Atención a tu alcance
                </Text>
                <Text style={styles.floatingSubtitle}>
                  Tu bienestar, primero
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionEyebrow}>
              BIENVENIDO A VITALIA
            </Text>

            <Text style={styles.sectionTitle}>
              Todo lo que necesitas, en un solo lugar.
            </Text>

            <Text style={styles.sectionDescription}>
              Organizamos tu experiencia médica para que
              puedas dedicar más tiempo a lo importante.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>01</Text>
            </View>

            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>
                Citas médicas
              </Text>
              <Text style={styles.featureDescription}>
                Encuentra especialistas y organiza tus citas.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>02</Text>
            </View>

            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>
                Historial de atención
              </Text>
              <Text style={styles.featureDescription}>
                Consulta tu información médica cuando
                esté disponible.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>03</Text>
            </View>

            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>
                Gestión de citas
              </Text>
              <Text style={styles.featureDescription}>
                Consulta y administra tus próximas visitas.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => setPantalla('ubicaciones')}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              Comenzar
            </Text>
            <Text style={styles.primaryButtonArrow}>→</Text>
          </Pressable>

          <Text style={styles.footerText}>
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
    backgroundColor: colores.verde,
  },

  scroll: {
    flex: 1,
    backgroundColor: colores.marfil,
  },

  scrollContent: {
    flexGrow: 1,
  },

  hero: {
    backgroundColor: colores.verde,
    paddingHorizontal: 28,
    paddingTop: 25,
    paddingBottom: 38,
    overflow: 'hidden',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  logoSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colores.dorado,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoSymbol: {
    color: colores.verdeProfundo,
    fontSize: 23,
    fontWeight: '700',
  },

  brandName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
    color: colores.marfil,
  },

  heroContent: {
    marginTop: 58,
  },

  eyebrow: {
    color: colores.dorado,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 19,
  },

  heroTitle: {
    color: colores.marfil,
    fontSize: 39,
    fontWeight: '600',
    lineHeight: 49,
    letterSpacing: -1.2,
  },

  heroTitleAccent: {
    color: colores.dorado,
  },

  heroDescription: {
    color: '#DAE4DC',
    fontSize: 14,
    lineHeight: 23,
    marginTop: 18,
    maxWidth: 320,
  },

  heroArtwork: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  outerCircle: {
    width: 193,
    height: 193,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#638073',
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: '#285346',
    borderWidth: 1,
    borderColor: '#547365',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCross: {
    fontSize: 74,
    color: colores.dorado,
    fontWeight: '300',
  },

  floatingCard: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: colores.blanco,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  floatingIcon: {
    backgroundColor: '#E6F1E8',
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  floatingCheck: {
    color: colores.verde,
    fontSize: 19,
    fontWeight: '700',
  },

  floatingTitle: {
    color: colores.verde,
    fontSize: 12,
    fontWeight: '700',
  },

  floatingSubtitle: {
    color: colores.gris,
    fontSize: 10,
    marginTop: 3,
  },

  content: {
    paddingHorizontal: 25,
    paddingTop: 37,
    paddingBottom: 35,
  },

  sectionHeading: {
    marginBottom: 23,
  },

  sectionEyebrow: {
    color: '#A48752',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },

  sectionTitle: {
    color: colores.verde,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 33,
  },

  sectionDescription: {
    color: colores.gris,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
  },

  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 15,
    padding: 17,
    marginBottom: 12,
  },

  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#ECF1EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureIconText: {
    color: colores.verde,
    fontSize: 13,
    fontWeight: '700',
  },

  featureText: {
    flex: 1,
    marginLeft: 14,
  },

  featureTitle: {
    color: colores.verde,
    fontSize: 14,
    fontWeight: '700',
  },

  featureDescription: {
    color: colores.gris,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  primaryButton: {
    backgroundColor: colores.verde,
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 19,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  primaryButtonText: {
    color: colores.blanco,
    fontSize: 15,
    fontWeight: '700',
  },

  primaryButtonArrow: {
    color: colores.dorado,
    fontSize: 23,
    fontWeight: '500',
  },

  footerText: {
    textAlign: 'center',
    color: '#9DAB9F',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 26,
  },

  locationHeader: {
    backgroundColor: colores.verde,
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 38,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 27,
  },

  backText: {
    color: colores.marfil,
    fontSize: 15,
  },

  locationEyebrow: {
    color: colores.dorado,
    letterSpacing: 2,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 39,
    marginBottom: 15,
  },

  locationTitle: {
    color: colores.marfil,
    fontSize: 31,
    lineHeight: 39,
    fontWeight: '700',
  },

  locationSubtitle: {
    color: '#DAE4DC',
    fontSize: 14,
    lineHeight: 23,
    marginTop: 13,
  },

  locationBody: {
    paddingHorizontal: 25,
    paddingTop: 32,
    paddingBottom: 35,
  },

  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: '#90784E',
    marginBottom: 19,
  },

  locationCard: {
    backgroundColor: colores.blanco,
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderRadius: 15,
    padding: 19,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationCardSelected: {
    borderColor: colores.verde,
    backgroundColor: '#EDF3EC',
  },

  locationCardContent: {
    flex: 1,
  },

  locationCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.verde,
  },

  locationCardDescription: {
    color: colores.gris,
    fontSize: 12,
    marginTop: 6,
  },

  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#B7C5BA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  radioSelected: {
    borderColor: colores.verde,
  },

  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colores.verde,
  },

  helperText: {
    color: colores.gris,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
});
