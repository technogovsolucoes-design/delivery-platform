import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { Tenant } from "@delivery/shared-types";
import { db } from "@/lib/firebase";

export default function StoresScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storesQuery = query(
      collection(db, "tenants"),
      where("category", "==", "bebidas"),
      where("status", "==", "active")
    );

    return onSnapshot(
      storesQuery,
      (snapshot) => {
        setStores(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Tenant));
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load stores", error);
        setLoading(false);
      }
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bebidas perto de você</Text>
      {loading ? (
        <ActivityIndicator color="#4f8cff" style={{ marginTop: 32 }} />
      ) : stores.length === 0 ? (
        <Text style={styles.empty}>Nenhuma loja disponível ainda por aqui.</Text>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/loja/${item.id}`)}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.address.neighborhood}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0d10", padding: 16, paddingTop: 60 },
  title: { color: "#e8eaed", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  empty: { color: "#9aa1ab", textAlign: "center", marginTop: 32 },
  card: { backgroundColor: "#14171b", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: "#e8eaed", fontSize: 16, fontWeight: "600" },
  cardMeta: { color: "#9aa1ab", fontSize: 13, marginTop: 4 },
});
