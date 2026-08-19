import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import type { Order } from "@delivery/shared-types";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { formatCents } from "@/lib/format";
import { ORDER_STATUS_LABEL, nextStatus } from "@/lib/order-status";
import { colors, radius, spacing, statusTint, type } from "@/lib/theme";

export default function PedidosScreen() {
  const { claims } = useAuth();
  const insets = useSafeAreaInsets();
  const tenantId = claims?.tenantId ?? null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const ordersQuery = query(collection(db, "tenants", tenantId, "orders"), orderBy("createdAt", "desc"));
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
  }, [tenantId]);

  async function advanceStatus(orderId: string, status: string) {
    if (!tenantId) return;
    await updateDoc(doc(db, "tenants", tenantId, "orders", orderId), {
      status,
      updatedAt: Date.now(),
    });
  }

  if (!tenantId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Pedidos</Text>
        <Text style={styles.empty}>
          Sua conta ainda não está vinculada a nenhuma loja. Peça para um admin configurar isso.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos</Text>
        <Pressable onPress={() => signOut(auth)} hitSlop={12}>
          <Text style={styles.logout}>Sair</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🧾</Text>
          <Text style={styles.empty}>Nenhum pedido recebido ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
          renderItem={({ item }) => {
            const next = nextStatus(item.status);
            const tint = statusTint(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Pedido #{item.id.slice(0, 8)}</Text>
                  <View style={[styles.badge, { backgroundColor: tint.bg }]}>
                    <Text style={[styles.badgeText, { color: tint.fg }]}>{ORDER_STATUS_LABEL[item.status]}</Text>
                  </View>
                </View>
                <Text style={styles.cardPrice}>{formatCents(item.totalCents)}</Text>
                {next && (
                  <Pressable style={styles.advanceButton} onPress={() => advanceStatus(item.id, next)}>
                    <Text style={styles.advanceButtonText}>Avançar para &quot;{ORDER_STATUS_LABEL[next]}&quot;</Text>
                  </Pressable>
                )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: { color: colors.textPrimary, ...type.h1 },
  logout: { color: colors.textSecondary, ...type.small },
  empty: { color: colors.textSecondary, ...type.body, textAlign: "center" },
  emptyState: { alignItems: "center", paddingTop: 32, paddingHorizontal: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  cardTitle: { color: colors.textPrimary, ...type.bodyBold },
  cardPrice: { color: colors.textPrimary, ...type.h2, marginBottom: spacing.md },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { ...type.caption },
  advanceButton: { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.sm, alignItems: "center" },
  advanceButtonText: { color: colors.white, ...type.caption },
});
