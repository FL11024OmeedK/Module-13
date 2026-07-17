import { Arimo_400Regular, Arimo_700Bold } from '@expo-google-fonts/arimo';
import { Oswald_700Bold } from '@expo-google-fonts/oswald';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// The root layout in Expo Router (located at app/_layout.tsx) replaces the traditional App.js or App.tsx file as the global entry point. It is used to define global navigators, handle the splash screen, wrap the app in global context providers, and load global assets like custom fonts.
export default function RootLayout() {
  // Load the bundled fonts, but never block rendering on them. Gating the whole
  // app on `fontsLoaded` risks a permanent blank screen if a font asset fetch
  // stalls over the tunnel. Instead we render immediately; React re-renders and
  // the custom fonts apply the moment useFonts resolves. Until then, text falls
  // back to the system font (a brief, harmless flash on a cold load).
  useFonts({ Oswald_700Bold, Arimo_400Regular, Arimo_700Bold });

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} /> 
      <StatusBar style="auto" />
    </>
  );
}
