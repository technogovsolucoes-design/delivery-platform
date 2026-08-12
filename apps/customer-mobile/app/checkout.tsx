import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import type { Order, OrderItem, Tenant, UserAddress, UserProfile } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/format";
import { colors, radius, spacing, type } from "@/lib/theme";
import { AddressForm, EMPTY_ADDRESS } from "@/components/AddressForm";

// Flat placeholder until real distance-based pricing is implemented.
const DELIVERY_FEE_CENTS = 500;

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const cart = useCart();
  const [address, setAddress] = useState<UserAddress>(EMPTY_ADDRESS);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  // Pre-fill from the customer's saved profile address, editable in place.
  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      const profile = snap.data() as UserProfile | undefined;
      if (profile?.address) setAddress(profile.address);
      setLoadingProfile(false);
    });
  }, [user]);

  const totalCents = cart.subtotalCents + DELIVERY_FEE_CENTS;
  const addressComplete = Boolean(address.cep && address.street && address.number && address.neighborhood && address.city && address.state);
  const canSubmit = Boolean(addressComplete && cart.tenantId && user && !submitting);

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
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipCode: address.cep,
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
      <View style={[styles.container, styles.confirmContainer, { paddingTop: insets.top + 64 }]}>
        <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>🎉</Text>
        <Text style={styles.confirmTitle}>Pedido confirmado!</Text>
        <Text style={styles.confirmMeta}>Nº {confirmedOrderId.slice(0, 8)}</Text>
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}
    >
      <Text style={styles.title}>Finalizar pedido</Text>

      {!authLoading && !user && (
        <View style={styles.authWarning}>
          <Text style={styles.authWarningText}>
            Não foi possível iniciar sua sessão. Verifique sua conexão e tente reabrir o app.
          </Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>Endereço de entrega</Text>
      {loadingProfile ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.md }} />
      ) : (
        <AddressForm value={address} onChange={setAddress} />
      )}

      <Text style={styles.sectionLabel}>Resumo</Text>
      <View style={styles.summary}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCents(cart.subtotalCents)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Entrega</Text>
          <Text style={styles.totalValue}>{formatCents(DELIVERY_FEE_CENTS)}</Text>
        </View>
        <View style={[styles.totalRow, styles.totalRowFinal]}>
          <Text style={styles.totalLabelFinal}>Total</Text>
          <Text style={styles.totalValueFinal}>{formatCents(totalCents)}</Text>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.checkoutButton, !canSubmit && styles.checkoutButtonDisabled]}
        onPress={handleConfirm}
        disabled={!canSubmit}
      >
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.checkoutButtonText}>
            {!addressComplete ? "Preencha o endereço" : "Confirmar pedido"}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.textPrimary, ...type.h1, marginBottom: spacing.lg },
  sectionLabel: {
    color: colors.textSecondary,
    ...type.caption,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  authWarning: {
    backgroundColor: "rgba(255,92,92,0.12)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  authWarningText: { color: colors.danger, ...type.small },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  totalRowFinal: { marginBottom: 0, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { color: colors.textSecondary, ...type.small },
  totalValue: { color: colors.textPrimary, ...type.body },
  totalLabelFinal: { color: colors.textPrimary, ...type.bodyBold },
  totalValueFinal: { color: colors.accent, ...type.h2 },
  error: { color: colors.danger, ...type.small, marginTop: spacing.md },
  checkoutButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  checkoutButtonDisabled: { opacity: 0.4 },
  checkoutButtonText: { color: colors.white, ...type.bodyBold },
  confirmContainer: { alignItems: "center", paddingHorizontal: spacing.xl },
  confirmTitle: { color: colors.textPrimary, ...type.h1, marginBottom: spacing.xs },
  confirmMeta: { color: colors.textSecondary, ...type.body, marginBottom: spacing.lg },
  confirmNote: { color: colors.textSecondary, ...type.small, textAlign: "center", marginBottom: spacing.xxl, lineHeight: 20 },
});
