import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { Product } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { colors, gradients, radius, spacing, type } from "@/lib/theme";

export default function StoreScreen() {
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    const productsQuery = query(
      collection(db, "tenants", tenantId, "products"),
      where("active", "==", true)
    );

    return onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product));
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load products", error);
        setLoading(false);
      }
    );
  }, [tenantId]);

  function handleAdd(product: Product) {
    if (cart.tenantId && cart.tenantId !== tenantId && cart.items.length > 0) {
      Alert.alert(
        "Trocar de loja?",
        "Seu carrinho tem itens de outra loja. Adicionar este produto vai esvaziar o carrinho atual.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Trocar", style: "destructive", onPress: () => cart.addItem(tenantId, product) },
        ]
      );
      return;
    }
    cart.addItem(tenantId, product);
  }

  function quantityOf(productId: string): number {
    if (tenantId !== cart.tenantId) return 0;
    return cart.items.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  const cartQuantity = tenantId === cart.tenantId ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 48 }} />
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40, marginBottom: spacing.md }}>📦</Text>
          <Text style={styles.emptyTitle}>Catálogo vazio</Text>
          <Text style={styles.emptyText}>Essa loja ainda não cadastrou produtos.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: cartQuantity > 0 ? 96 : spacing.lg,
          }}
          renderItem={({ item }) => {
            const qty = quantityOf(item.id);
            return (
              <View style={styles.card}>
                <ProductImage category={item.category} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardPrice}>{formatCents(item.priceCents)}</Text>
                </View>
                {qty > 0 ? (
                  <View style={styles.stepper}>
                    <Pressable
                      style={styles.stepperButton}
                      onPress={() => cart.setQuantity(item.id, qty - 1)}
                    >
                      <Text style={styles.stepperButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.stepperValue}>{qty}</Text>
                    <Pressable style={styles.stepperButton} onPress={() => handleAdd(item)}>
                      <Text style={styles.stepperButtonText}>+</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.addButton} onPress={() => handleAdd(item)}>
                    <Text style={styles.addButtonText}>Adicionar</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}

      {cartQuantity > 0 && (
        <Pressable
          style={[styles.cartBarWrap, { bottom: insets.bottom + spacing.md }]}
          onPress={() => router.push("/carrinho")}
        >
          <LinearGradient colors={gradients.gold} style={styles.cartBar}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
            </View>
            <Text style={styles.cartBarText}>Ver carrinho</Text>
            <Text style={styles.cartBarPrice}>{formatCents(cart.subtotalCents)}</Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 64, paddingHorizontal: spacing.xl },
  emptyTitle: { color: colors.textPrimary, ...type.h2, marginBottom: spacing.xs },
  emptyText: { color: colors.textSecondary, ...type.body, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  cardTitle: { color: colors.textPrimary, ...type.bodyBold, marginBottom: 4 },
  cardPrice: { color: colors.accent, ...type.body, fontFamily: type.bodyBold.fontFamily, fontWeight: type.bodyBold.fontWeight },
  addButton: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addButtonText: { color: colors.goldLight, ...type.caption },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonText: { color: colors.white, fontSize: 18, fontWeight: "700", marginTop: -2 },
  stepperValue: { color: colors.textPrimary, ...type.bodyBold, minWidth: 16, textAlign: "center" },
  cartBarWrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cartBar: {
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cartBadge: {
    backgroundColor: "rgba(23,17,10,0.2)",
    borderRadius: radius.pill,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  cartBadgeText: { color: "#17110A", ...type.caption },
  cartBarText: { color: "#17110A", ...type.bodyBold, flex: 1 },
  cartBarPrice: { color: "#17110A", ...type.bodyBold },
});
