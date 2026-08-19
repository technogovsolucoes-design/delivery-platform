import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import type { Product } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { formatCents } from "@/lib/format";
import { categoryStyle, colors, radius, spacing, type } from "@/lib/theme";

export default function EstoqueScreen() {
  const { claims } = useAuth();
  const insets = useSafeAreaInsets();
  const tenantId = claims?.tenantId ?? null;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [priceReais, setPriceReais] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const productsQuery = query(collection(db, "tenants", tenantId, "products"), orderBy("name"));
    return onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load products", error);
        setLoading(false);
      }
    );
  }, [tenantId]);

  async function handleAddProduct() {
    if (!tenantId || !name || !priceReais || !stockQuantity) return;
    setSubmitting(true);
    try {
      const now = Date.now();
      const priceCents = Math.round(Number(priceReais.replace(",", ".")) * 100);
      const product: Omit<Product, "id"> = {
        tenantId,
        name,
        description: "",
        priceCents: Number.isFinite(priceCents) ? priceCents : 0,
        imageUrl: null,
        category: "geral",
        active: true,
        stockQuantity: Number(stockQuantity) || 0,
        lowStockThreshold: 5,
        createdAt: now,
        updatedAt: now,
      };
      await addDoc(collection(db, "tenants", tenantId, "products"), product);
      setName("");
      setPriceReais("");
      setStockQuantity("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStockChange(productId: string, delta: number, current: number) {
    if (!tenantId) return;
    await updateDoc(doc(db, "tenants", tenantId, "products", productId), {
      stockQuantity: Math.max(0, current + delta),
      updatedAt: Date.now(),
    });
  }

  async function handleToggleActive(product: Product) {
    if (!tenantId) return;
    await updateDoc(doc(db, "tenants", tenantId, "products", product.id), {
      active: !product.active,
      updatedAt: Date.now(),
    });
  }

  async function handleDelete(productId: string) {
    if (!tenantId) return;
    await deleteDoc(doc(db, "tenants", tenantId, "products", productId));
  }

  if (!tenantId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Estoque</Text>
        <Text style={styles.empty}>
          Sua conta ainda não está vinculada a nenhuma loja. Peça para um admin configurar isso.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>Estoque</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Preço (R$)"
            placeholderTextColor={colors.textMuted}
            inputMode="decimal"
            value={priceReais}
            onChangeText={setPriceReais}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Estoque"
            placeholderTextColor={colors.textMuted}
            inputMode="numeric"
            value={stockQuantity}
            onChangeText={setStockQuantity}
          />
        </View>
        <Pressable
          style={[styles.addButton, (!name || !priceReais || !stockQuantity) && styles.addButtonDisabled]}
          onPress={handleAddProduct}
          disabled={submitting || !name || !priceReais || !stockQuantity}
        >
          {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.addButtonText}>Adicionar produto</Text>}
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40, marginBottom: spacing.md }}>📦</Text>
          <Text style={styles.empty}>Nenhum produto cadastrado ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
          renderItem={({ item }) => {
            const { emoji, tint } = categoryStyle(item.category);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.categoryTag, { backgroundColor: tint }]}>
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardPrice}>{formatCents(item.priceCents)}</Text>
                  </View>
                  <Pressable
                    style={[styles.statusBadge, { backgroundColor: item.active ? colors.successMuted : colors.surfaceRaised }]}
                    onPress={() => handleToggleActive(item)}
                  >
                    <Text style={{ color: item.active ? colors.success : colors.textSecondary, ...type.caption }}>
                      {item.active ? "Ativo" : "Inativo"}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.cardBottom}>
                  <View style={styles.stepper}>
                    <Pressable style={styles.stepperButton} onPress={() => handleStockChange(item.id, -1, item.stockQuantity)}>
                      <Text style={styles.stepperButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.stepperValue}>{item.stockQuantity} un.</Text>
                    <Pressable style={styles.stepperButton} onPress={() => handleStockChange(item.id, 1, item.stockQuantity)}>
                      <Text style={styles.stepperButtonText}>+</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteText}>Excluir</Text>
                  </Pressable>
                </View>
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
  title: { color: colors.textPrimary, ...type.h1, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  empty: { color: colors.textSecondary, ...type.body, textAlign: "center" },
  emptyState: { alignItems: "center", paddingTop: 32, paddingHorizontal: spacing.xl },
  form: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    ...type.body,
  },
  addButton: { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md, alignItems: "center" },
  addButtonDisabled: { opacity: 0.4 },
  addButtonText: { color: colors.white, ...type.bodyBold },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  categoryTag: { width: 40, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: colors.textPrimary, ...type.bodyBold },
  cardPrice: { color: colors.textSecondary, ...type.small, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonText: { color: colors.white, fontSize: 16, fontWeight: "700", marginTop: -2 },
  stepperValue: { color: colors.textPrimary, ...type.small, minWidth: 48, textAlign: "center" },
  deleteText: { color: colors.danger, ...type.small },
});
