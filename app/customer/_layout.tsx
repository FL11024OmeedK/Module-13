import { faBurger, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import { CartProvider } from '@/contexts/CartContext';

export default function CustomerLayout() {
  return (
    <CartProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.orangeRed,
            tabBarInactiveTintColor: COLORS.darkCharcoal,
            tabBarStyle: { backgroundColor: COLORS.white },
          }}>
          <Tabs.Screen
            name="restaurant"
            options={{
              title: 'Restaurants',
              tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faBurger} color={color} size={20} />,
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'OrderHistory',
              tabBarIcon: ({ color }) => (
                <FontAwesomeIcon icon={faClockRotateLeft} color={color} size={20} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});
