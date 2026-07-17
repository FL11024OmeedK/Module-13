import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/components/AppText";
import { COLORS } from "@/constants/colors";

type OrderProduct = {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
};

export type Order = {
  id: number;
  restaurant_name: string;
  courier_name: string | null;
  status: string;
  products: OrderProduct[];
  total_cost: number;
  created_on: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const [token, customerId] = await Promise.all([
        AsyncStorage.getItem("accessToken"),
        AsyncStorage.getItem("customer_id"),
      ]);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_URL}/api/orders?type=customer&id=${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const json = await response.json();
      setOrders(json.data ?? []);
    };

    fetchOrders();
  }, [orders.length]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>My Orders</Text>

      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.orderCol]}>ORDER</Text>
          <Text style={[styles.headerCell, styles.statusCol]}>STATUS</Text>
          <Text style={[styles.headerCell, styles.viewCol]}>VIEW</Text>
        </View>

        {orders.map((order) => (
          <View key={order.id} style={styles.row}>
            <Text style={[styles.cell, styles.orderCol]}>
              {order.restaurant_name}
            </Text>
            <Text style={[styles.cell, styles.statusCol]}>
              {order.status.toUpperCase()}
            </Text>
            <View style={[styles.viewCol, styles.viewCell]}>
              <Pressable onPress={() => setSelectedOrder(order)}>
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  color={COLORS.darkCharcoal}
                  size={16}
                />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Modal visible={selectedOrder !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedOrder?.restaurant_name}
              </Text>
              <Pressable onPress={() => setSelectedOrder(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            {selectedOrder && (
              <View style={styles.modalBody}>
                <Text style={styles.metaLine}>
                  Order Date: {formatDate(selectedOrder.created_on)}
                </Text>
                <Text style={styles.metaLine}>
                  Status: {selectedOrder.status.toUpperCase()}
                </Text>
                <Text style={styles.metaLine}>
                  Courier: {selectedOrder.courier_name ?? ""}
                </Text>

                <View style={styles.modalDivider} />

                {selectedOrder.products.map((product) => (
                  <View key={product.product_id} style={styles.productLine}>
                    <Text style={styles.productName}>
                      {product.product_name}
                    </Text>
                    <Text style={styles.productQty}>x{product.quantity}</Text>
                    <Text style={styles.productPrice}>
                      ${product.total_cost.toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL:</Text>
                  <Text style={styles.totalValue}>
                    ${selectedOrder.total_cost.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
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
    fontFamily: "Oswald_700Bold",
    color: COLORS.darkCharcoal,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  table: {
    borderRadius: 4,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: COLORS.darkCharcoal,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerCell: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  cell: {
    color: COLORS.darkCharcoal,
    fontSize: 13,
  },
  orderCol: {
    flex: 2,
  },
  statusCol: {
    flex: 1,
  },
  viewCol: {
    width: 48,
    alignItems: "center",
  },
  viewCell: {
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.darkCharcoal,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    color: COLORS.orangeRed,
    fontWeight: "bold",
    fontSize: 16,
  },
  modalClose: {
    color: COLORS.white,
    fontSize: 16,
  },
  modalBody: {
    padding: 16,
  },
  metaLine: {
    fontSize: 13,
    color: COLORS.darkCharcoal,
    marginBottom: 2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  productLine: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  productName: {
    flex: 1,
    color: COLORS.darkCharcoal,
    fontSize: 13,
  },
  productQty: {
    width: 40,
    textAlign: "right",
    color: COLORS.darkCharcoal,
    fontSize: 13,
  },
  productPrice: {
    width: 80,
    textAlign: "right",
    color: COLORS.darkCharcoal,
    fontSize: 13,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  totalLabel: {
    fontWeight: "bold",
    color: COLORS.darkCharcoal,
  },
  totalValue: {
    fontWeight: "bold",
    color: COLORS.darkCharcoal,
  },
});
