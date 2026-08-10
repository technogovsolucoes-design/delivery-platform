import { FlatList, StyleSheet, Text, View } from "react-native";

// Placeholder data — swap for a live Firestore query over tenants/{tenantId}/orders.
interface OrderPreview {
  id: string;
  customerName: string;
  totalLabel: string;
  status: string;
}

const MOCK_ORDERS: OrderPreview[] = [
  { id: "pedido-1", customerName: "Maria Silva", totalLabel: "R$ 48,90", status: "Novo" },
  { id: "pedido-2", customerName: "João Pereira", totalLabel: "R$ 132,50", status: "Preparando" },
];

export default function PedidosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos</Text>
      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.customerName}</Text>
            <Text style={styles.cardMeta}>
              {item.totalLabel} · {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0d10", padding: 16, paddingTop: 60 },
  title: { color: "#e8eaed", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  card: { backgroundColor: "#14171b", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: "#e8eaed", fontSize: 16, fontWeight: "600" },
  cardMeta: { color: "#9aa1ab", fontSize: 13, marginTop: 4 },
});
