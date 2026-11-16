import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F8F5ED' },
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="acceso" />
        <Stack.Screen name="paciente" />
        <Stack.Screen name="panel" />
        <Stack.Screen name="ciudades" />
        <Stack.Screen name="hospital" />
        <Stack.Screen name="mis-citas" />
        <Stack.Screen name="reprogramar" />
      </Stack>
    </ThemeProvider>
  );
}
