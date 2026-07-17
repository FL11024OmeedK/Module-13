import AsyncStorage from '@react-native-async-storage/async-storage';
import { faCircleCheck, faCircleXmark, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { COLORS } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';

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
  const restaurantId = Number(id);
  const { quantities, setActiveRestaurant, increment, decrement, clearQuantities } = useCart();
  const [restaurant, setRestaurant] = useState<RestaurantHeader | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [orderState, setOrderState] = useState<'idle' | 'processing' | 'success' | 'error'>(
    'idle'
  );

  useEffect(() => {
    setActiveRestaurant(restaurantId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

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

  const hasAnyQuantity = Object.values(quantities).some((q) => q > 0);
  const selectedItems = products
    .filter((p) => (quantities[p.id] ?? 0) > 0)
    .map((p) => ({ ...p, quantity: quantities[p.id] }));

  const total = selectedItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  const confirmOrder = async () => {
    setOrderState('processing');
    try {
      const [token, customerId] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('customer_id'),
      ]);

      const response = await fetch(`${process.env.EXPO_PUBLIC_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          customer_id: Number(customerId),
          products: selectedItems.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      setOrderState(response.ok ? 'success' : 'error');
    } catch {
      setOrderState('error');
    }
  };

  const closeModal = () => {
    // The success summary is rendered from live quantities, so only clear
    // them once the modal is dismissed — not the moment the order succeeds.
    if (orderState === 'success') {
      clearQuantities();
    }
    setModalVisible(false);
    setOrderState('idle');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Restaurant Menu</Text>

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
              <Pressable onPress={closeModal}>
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

            <View style={styles.modalFooter}>
              {orderState !== 'success' && (
                <Pressable
                  style={[
                    styles.confirmButton,
                    orderState === 'processing' && styles.confirmButtonDisabled,
                  ]}
                  disabled={orderState === 'processing'}
                  onPress={confirmOrder}>
                  <Text style={styles.confirmButtonText}>
                    {orderState === 'processing' ? 'Processing Order...' : 'CONFIRM ORDER'}
                  </Text>
                </Pressable>
              )}

              {orderState === 'success' && (
                <View style={styles.statusBlock}>
                  <FontAwesomeIcon icon={faCircleCheck} color={COLORS.mutedGreen} size={28} />
                  <Text style={styles.statusText}>
                    Thank you!{'\n'}Your order has been received.
                  </Text>
                </View>
              )}

              {orderState === 'error' && (
                <View style={styles.statusBlock}>
                  <FontAwesomeIcon icon={faCircleXmark} color={COLORS.darkRed} size={28} />
                  <Text style={styles.statusText}>
                    Your order was not processed successfully.{'\n'}Please try again.
                  </Text>
                </View>
              )}
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Oswald_700Bold',
    color: COLORS.darkCharcoal,
    marginBottom: 12,
    textTransform: 'uppercase',
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
    flex: 1,
    marginRight: 12,
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
    flexShrink: 0,
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
  modalFooter: {
    padding: 16,
    paddingTop: 4,
  },
  confirmButton: {
    backgroundColor: COLORS.orangeRed,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statusBlock: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
  },
  statusText: {
    textAlign: 'center',
    color: COLORS.darkCharcoal,
    fontSize: 13,
  },
});
