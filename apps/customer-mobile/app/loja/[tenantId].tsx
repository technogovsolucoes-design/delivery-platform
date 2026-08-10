import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function StoreScreen() {
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Catálogo da loja {tenantId} — a implementar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0d10", alignItems: "center", justifyContent: "center", padding: 16 },
  text: { color: "#e8eaed", textAlign: "center" },
});
