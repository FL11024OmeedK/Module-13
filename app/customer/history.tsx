import { StyleSheet, Text, View } from 'react-native';

export default function OrderHistory() {
  return (
    <View style={styles.container}>
      <Text>Order History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
