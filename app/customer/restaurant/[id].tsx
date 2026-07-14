import AsyncStorage from '@react-native-async-storage/async-storage';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '@/constants/colors';

type RestaurantHeader = {
  name: string;
  rating: number;
  price_range: number;
};

type Product = {
  id: number;
  name: string;
  description: string;
  cost: number;
  restaurant_id: number;
};

export default function RestaurantMenu() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<RestaurantHeader | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [modalVisible, setModalVisible] = useState(false);

  // Reset quantities every time this screen gains focus (first visit, a new
  // restaurant, or navigating back to a previously-visited one). A plain
  // useEffect keyed on `id` isn't enough: Expo Router's Stack can preserve a
  // screen instance across navigation, so returning to an already-visited
  // restaurant doesn't re-fire an id-only effect and can leave stale
  // quantities in place.
  useFocusEffect(
    useCallback(() => {
      setQuantities({});
    }, [])
  );

  useEffect(() => {
    const fetchMenu = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [restaurantRes, productsRes] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_URL}/api/restaurants/${id}`, { headers }),
        fetch(`${process.env.EXPO_PUBLIC_URL}/api/products?restaurant=${id}`, { headers }),
      ]);

      const restaurantJson = await restaurantRes.json();
      const productsJson = await productsRes.json();

      setRestaurant(restaurantJson.data ?? null);
      setProducts(productsJson.data ?? []);
    };

    fetchMenu();
  }, [id]);

  const increment = (productId: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  };

  const decrement = (productId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] ?? 0) - 1),
    }));
  };

  const hasAnyQuantity = Object.values(quantities).some((q) => q > 0);

  const selectedItems = products
    .filter((p) => (quantities[p.id] ?? 0) > 0)
    .map((p) => ({ ...p, quantity: quantities[p.id] }));

  const total = selectedItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {restaurant && (
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Pressable
              style={[styles.createOrderButton, !hasAnyQuantity && styles.createOrderDisabled]}
              disabled={!hasAnyQuantity}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.createOrderText}>Create Order</Text>
            </Pressable>
          </View>
          <Text style={styles.headerDetail}>Price: {'$'.repeat(restaurant.price_range)}</Text>
          <View style={styles.headerDetail}>
            <View style={styles.stars}>
              {Array.from({ length: restaurant.rating }).map((_, i) => (
                <FontAwesomeIcon key={i} icon={faStar} color={COLORS.warmYellow} size={14} />
              ))}
            </View>
          </View>
        </View>
      )}

      {products.map((product) => {
        const quantity = quantities[product.id] ?? 0;
        return (
          <View key={product.id} style={styles.itemRow}>
            <Image source={require('@/assets/images/RestaurantMenu.jpg')} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{product.name}</Text>
              <Text style={styles.itemPrice}>${product.cost.toFixed(2)}</Text>
              <Text style={styles.itemDescription}>{product.description}</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => decrement(product.id)}
                disabled={quantity === 0}>
                <Text style={styles.stepperButtonText}>−</Text>
              </Pressable>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <Pressable style={styles.stepperButton} onPress={() => increment(product.id)}>
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Confirmation</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.modalSummaryLabel}>Order Summary</Text>
            {selectedItems.map((item) => (
              <View key={item.id} style={styles.modalItemRow}>
                <Text style={styles.modalItemName}>
                  {item.name} x{item.quantity}
                </Text>
                <Text style={styles.modalItemPrice}>
                  ${(item.cost * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.modalTotalRow}>
              <Text style={styles.modalTotalLabel}>TOTAL:</Text>
              <Text style={styles.modalTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkCharcoal,
  },
  headerDetail: {
    fontSize: 13,
    color: COLORS.darkCharcoal,
    marginBottom: 2,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  createOrderButton: {
    backgroundColor: COLORS.orangeRed,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  createOrderDisabled: {
    opacity: 0.4,
  },
  createOrderText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkCharcoal,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.darkCharcoal,
  },
  itemDescription: {
    fontSize: 11,
    color: '#666666',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.darkCharcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepperValue: {
    minWidth: 18,
    textAlign: 'center',
    color: COLORS.darkCharcoal,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.darkCharcoal,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalClose: {
    color: COLORS.white,
    fontSize: 16,
  },
  modalSummaryLabel: {
    fontWeight: 'bold',
    color: COLORS.darkCharcoal,
    padding: 16,
    paddingBottom: 8,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  modalItemName: {
    color: COLORS.darkCharcoal,
  },
  modalItemPrice: {
    color: COLORS.darkCharcoal,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  modalTotalLabel: {
    fontWeight: 'bold',
    color: COLORS.darkCharcoal,
  },
  modalTotalValue: {
    fontWeight: 'bold',
    color: COLORS.darkCharcoal,
  },
});
