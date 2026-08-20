import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collectionGroup, onSnapshot, orderBy, query, where } from "firebase/firestore";
import type { Order } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { formatCents } from "@/lib/format";
import { ORDER_STATUS_LABEL, statusTint } from "@/lib/order-status";
import { colors, gradients, radius, spacing, type } from "@/lib/theme";

export default function MeusPedidosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const ordersQuery = query(
      collectionGroup(db, "orders"),
      where("customerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load orders", error);
        setLoading(false);
      }
    );
  }, [user]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Voltar</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>Meus pedidos</Text>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient colors={gradients.gold} style={styles.emptyIcon}>
            <Text style={{ fontSize: 28 }}>🧾</Text>
          </LinearGradient>
          <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
          <Text style={styles.emptyText}>Seus pedidos vão aparecer aqui.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
          renderItem={({ item }) => {
            const tint = statusTint(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Pedido #{item.id.slice(0, 8)}</Text>
                  <View style={[styles.badge, { backgroundColor: tint.bg }]}>
                    <Text style={[styles.badgeText, { color: tint.fg }]}>{ORDER_STATUS_LABEL[item.status]}</Text>
                  </View>
                </View>
                <Text style={styles.cardItems} numberOfLines={2}>
                  {item.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </Text>
                <Text style={styles.cardPrice}>{formatCents(item.totalCents)}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  back: { color: colors.textSecondary, ...type.body },
  title: { color: colors.textPrimary, ...type.h1, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  emptyState: { alignItems: "center", paddingTop: 48, paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: { color: colors.textPrimary, ...type.h2, marginBottom: spacing.xs },
  emptyText: { color: colors.textSecondary, ...type.body, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  cardTitle: { color: colors.textPrimary, ...type.bodyBold },
  cardItems: { color: colors.textSecondary, ...type.small, marginBottom: spacing.sm },
  cardPrice: { color: colors.textPrimary, ...type.h2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { ...type.caption },
});
