import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/format";

export default function CartScreen() {
  const cart = useCart();
  const router = useRouter();

  if (cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Seu carrinho está vazio.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{formatCents(item.unitPriceCents)} un.</Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable
                style={styles.qtyButton}
                onPress={() => cart.setQuantity(item.productId, item.quantity - 1)}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <Pressable
                style={styles.qtyButton}
                onPress={() => cart.setQuantity(item.productId, item.quantity + 1)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCents(cart.subtotalCents)}</Text>
        </View>
        <Pressable style={styles.checkoutButton} onPress={() => router.push("/checkout")}>
          <Text style={styles.checkoutButtonText}>Ir para o checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0d10", padding: 16 },
  empty: { color: "#9aa1ab", textAlign: "center", marginTop: 32 },
  row: {
    backgroundColor: "#14171b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: { color: "#e8eaed", fontSize: 16, fontWeight: "600" },
  itemMeta: { color: "#9aa1ab", fontSize: 13, marginTop: 4 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#23272e",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: { color: "#e8eaed", fontSize: 16, fontWeight: "700", marginTop: -2 },
  qtyValue: { color: "#e8eaed", fontSize: 15, fontWeight: "600", minWidth: 18, textAlign: "center" },
  footer: { borderTopWidth: 1, borderTopColor: "#23272e", paddingTop: 16, marginTop: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  totalLabel: { color: "#9aa1ab", fontSize: 15 },
  totalValue: { color: "#e8eaed", fontSize: 18, fontWeight: "700" },
  checkoutButton: { backgroundColor: "#4f8cff", borderRadius: 12, padding: 16, alignItems: "center" },
  checkoutButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
