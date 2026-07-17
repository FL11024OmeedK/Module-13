import { Text as RNText, StyleSheet, TextProps } from 'react-native';

// Drop-in replacement for react-native's Text that defaults every text node to
// the bundled Arimo font, so body text renders identically on iOS and Android
// instead of falling back to each platform's system font (San Francisco vs
// Roboto). Bold text maps to the Arimo_700Bold file (custom fonts don't
// synthesize weight reliably from fontWeight). Any style that sets its own
// fontFamily (e.g. the Oswald section titles) is respected as-is.
export function AppText(props: TextProps) {
  const flat = StyleSheet.flatten(props.style) ?? {};
  const isBold = flat.fontWeight === 'bold' || flat.fontWeight === '700';
  const fontFamily = flat.fontFamily ?? (isBold ? 'Arimo_700Bold' : 'Arimo_400Regular');

  return <RNText {...props} style={[props.style, { fontFamily }]} />;
}
