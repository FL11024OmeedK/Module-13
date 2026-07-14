import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { COLORS } from '@/constants/colors';

export default function Header() {
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'user_id', 'customer_id']);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/AppLogoV1.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOG OUT</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 140,
    height: 36,
  },
  logoutButton: {
    backgroundColor: COLORS.orangeRed,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
