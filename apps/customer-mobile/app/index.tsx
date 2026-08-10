import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

// Placeholder data — swap for a Firestore query over tenants where category == "bebidas".
interface StorePreview {
  id: string;
  name: string;
  etaMinutes: number;
}

const MOCK_STORES: StorePreview[] = [
  { id: "loja-1", name: "Adega Boa Vista", etaMinutes: 25 },
  { id: "loja-2", name: "Empório da Cerveja", etaMinutes: 35 },
  { id: "loja-3", name: "Bebidas Express", etaMinutes: 20 },
];

export default function StoresScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bebidas perto de você</Text>
      <FlatList
        data={MOCK_STORES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/loja/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.etaMinutes} min</Text>
          </Pressable>
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
