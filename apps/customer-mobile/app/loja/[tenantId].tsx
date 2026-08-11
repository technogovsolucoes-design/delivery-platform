import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { Product } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/format";

export default function StoreScreen() {
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();
  const router = useRouter();
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

  const cartQuantity = tenantId === cart.tenantId ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#4f8cff" style={{ marginTop: 32 }} />
      ) : products.length === 0 ? (
        <Text style={styles.empty}>Essa loja ainda não cadastrou produtos.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: cartQuantity > 0 ? 88 : 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>{formatCents(item.priceCents)}</Text>
              </View>
              <Pressable style={styles.addButton} onPress={() => handleAdd(item)}>
                <Text style={styles.addButtonText}>+</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {cartQuantity > 0 && (
        <Pressable style={styles.cartBar} onPress={() => router.push("/carrinho")}>
          <Text style={styles.cartBarText}>
            Ver carrinho ({cartQuantity}) · {formatCents(cart.subtotalCents)}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0d10", padding: 16 },
  empty: { color: "#9aa1ab", textAlign: "center", marginTop: 32 },
  card: {
    backgroundColor: "#14171b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: { color: "#e8eaed", fontSize: 16, fontWeight: "600" },
  cardMeta: { color: "#9aa1ab", fontSize: 13, marginTop: 4 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4f8cff",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: -2 },
  cartBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#4f8cff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cartBarText: { color: "#fff", fontWeight: "700" },
});
