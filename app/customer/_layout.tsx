import { faBurger, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Tabs } from 'expo-router';

import { COLORS } from '@/constants/colors';

export default function CustomerLayout() {
  return (
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
  );
}
