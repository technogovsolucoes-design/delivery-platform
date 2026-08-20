import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/format";
import { colors, gradients, radius, spacing, type } from "@/lib/theme";

export default function CartScreen() {
  const cart = useCart();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (cart.items.length === 0) {
    return (
      <View style={[styles.container, styles.emptyState, { paddingTop: insets.top + 64 }]}>
        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🛒</Text>
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptyText}>Escolha uma loja e adicione produtos.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.title}>Seu carrinho</Text>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCents(cart.subtotalCents)}</Text>
        </View>
        <Pressable onPress={() => router.push("/checkout")}>
          <LinearGradient colors={gradients.gold} style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Ir para o checkout</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.textPrimary, ...type.h1, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  emptyState: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  emptyTitle: { color: colors.textPrimary, ...type.h2, marginBottom: spacing.xs },
  emptyText: { color: colors.textSecondary, ...type.body, textAlign: "center" },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  itemName: { color: colors.textPrimary, ...type.bodyBold },
  itemMeta: { color: colors.textSecondary, ...type.small, marginTop: 2 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginTop: -2 },
  qtyValue: { color: colors.textPrimary, ...type.bodyBold, minWidth: 18, textAlign: "center" },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  totalLabel: { color: colors.textSecondary, ...type.body },
  totalValue: { color: colors.textPrimary, ...type.h2 },
  checkoutButton: { borderRadius: radius.md, padding: spacing.md, alignItems: "center" },
  checkoutButtonText: { color: "#17110A", ...type.bodyBold },
});
