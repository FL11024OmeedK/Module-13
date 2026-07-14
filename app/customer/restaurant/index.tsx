import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Restaurants() {
  return (
    <View style={styles.container}>
      <Text>Restaurants</Text>
      {/* TEMP: links to prove list → menu navigation until real cards exist */}
      <Link href="/customer/restaurant/1">Restaurant 1</Link>
      <Link href="/customer/restaurant/2">Restaurant 2</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
