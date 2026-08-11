import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import type { Order, OrderItem, Tenant } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/format";

// Flat placeholder until real distance-based pricing is implemented.
const DELIVERY_FEE_CENTS = 500;

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const cart = useCart();
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const totalCents = cart.subtotalCents + DELIVERY_FEE_CENTS;
  const canSubmit = Boolean(street && number && neighborhood && cart.tenantId && user && !submitting);

  async function handleConfirm() {
    if (!cart.tenantId || !user) return;
    setSubmitting(true);
    setError(null);

    try {
      const tenantSnap = await getDoc(doc(db, "tenants", cart.tenantId));
      const tenant = tenantSnap.data() as Tenant | undefined;
      const commissionRate = tenant?.commissionRate ?? 0;

      const items: OrderItem[] = cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
      }));

      const now = Date.now();
      const order: Omit<Order, "id"> = {
        tenantId: cart.tenantId,
        customerId: user.uid,
        items,
        status: "pending_payment",
        subtotalCents: cart.subtotalCents,
        deliveryFeeCents: DELIVERY_FEE_CENTS,
        totalCents,
        payment: {
          provider: "mercado_pago",
          preferenceId: null,
          paymentId: null,
          status: "pending",
          platformFeeCents: Math.round(cart.subtotalCents * commissionRate),
        },
        deliveryAddress: {
          street,
          number,
          neighborhood,
          city: tenant?.address.city ?? "",
          state: tenant?.address.state ?? "",
          zipCode: "",
          lat: 0,
          lng: 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      const orderRef = await addDoc(collection(db, "tenants", cart.tenantId, "orders"), order);
      setConfirmedOrderId(orderRef.id);
      cart.clear();
    } catch (err) {
      console.error("Failed to create order", err);
      setError("Não foi possível confirmar o pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedOrderId) {
    return (
      <View style={styles.container}>
        <Text style={styles.confirmTitle}>Pedido confirmado!</Text>
        <Text style={styles.confirmMeta}>Número do pedido: {confirmedOrderId}</Text>
        <Text style={styles.confirmNote}>
          O pagamento será processado na próxima etapa — por enquanto o pedido fica com status
          &quot;aguardando pagamento&quot;.
        </Text>
        <Pressable style={styles.checkoutButton} onPress={() => router.replace("/")}>
          <Text style={styles.checkoutButtonText}>Voltar ao início</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Endereço de entrega</Text>
      <TextInput
        style={styles.input}
        placeholder="Rua"
        placeholderTextColor="#9aa1ab"
        value={street}
        onChangeText={setStreet}
      />
      <TextInput
        style={styles.input}
        placeholder="Número"
        placeholderTextColor="#9aa1ab"
        value={number}
        onChangeText={setNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Bairro"
        placeholderTextColor="#9aa1ab"
        value={neighborhood}
        onChangeText={setNeighborhood}
      />

      <View style={styles.summary}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCents(cart.subtotalCents)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Entrega</Text>
          <Text style={styles.totalValue}>{formatCents(DELIVERY_FEE_CENTS)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { fontWeight: "700" }]}>Total</Text>
          <Text style={[styles.totalValue, { fontSize: 18 }]}>{formatCents(totalCents)}</Text>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.checkoutButton, !canSubmit && styles.checkoutButtonDisabled]}
        onPress={handleConfirm}
        disabled={!canSubmit}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutButtonText}>Confirmar pedido</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0d10", padding: 16 },
  title: { color: "#e8eaed", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: "#14171b",
    borderColor: "#23272e",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "#e8eaed",
    marginBottom: 12,
  },
  summary: { backgroundColor: "#14171b", borderRadius: 12, padding: 16, marginTop: 12, marginBottom: 16 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  totalLabel: { color: "#9aa1ab", fontSize: 14 },
  totalValue: { color: "#e8eaed", fontSize: 15, fontWeight: "600" },
  error: { color: "#ff6b6b", fontSize: 13, marginBottom: 12 },
  checkoutButton: { backgroundColor: "#4f8cff", borderRadius: 12, padding: 16, alignItems: "center" },
  checkoutButtonDisabled: { opacity: 0.5 },
  checkoutButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  confirmTitle: { color: "#e8eaed", fontSize: 20, fontWeight: "700", marginTop: 32, marginBottom: 8 },
  confirmMeta: { color: "#9aa1ab", fontSize: 14, marginBottom: 16 },
  confirmNote: { color: "#9aa1ab", fontSize: 13, marginBottom: 24, lineHeight: 20 },
});
