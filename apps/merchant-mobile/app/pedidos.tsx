import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import type { Order } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { formatCents } from "@/lib/format";
import { ORDER_STATUS_LABEL, nextStatus } from "@/lib/order-status";

export default function PedidosScreen() {
  const { claims } = useAuth();
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
      <View style={styles.container}>
        <Text style={styles.title}>Pedidos</Text>
        <Text style={styles.empty}>
          Sua conta ainda não está vinculada a nenhuma loja. Peça para um admin configurar isso.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos</Text>
      {loading ? (
        <ActivityIndicator color="#4f8cff" style={{ marginTop: 32 }} />
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>Nenhum pedido recebido ainda.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const next = nextStatus(item.status);
            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Pedido {item.id.slice(0, 8)}</Text>
                <Text style={styles.cardMeta}>
                  {formatCents(item.totalCents)} · {ORDER_STATUS_LABEL[item.status]}
                </Text>
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
  container: { flex: 1, backgroundColor: "#0b0d10", padding: 16, paddingTop: 60 },
  title: { color: "#e8eaed", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  empty: { color: "#9aa1ab" },
  card: { backgroundColor: "#14171b", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: "#e8eaed", fontSize: 16, fontWeight: "600" },
  cardMeta: { color: "#9aa1ab", fontSize: 13, marginTop: 4, marginBottom: 12 },
  advanceButton: { backgroundColor: "#4f8cff", borderRadius: 8, padding: 10, alignItems: "center" },
  advanceButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
