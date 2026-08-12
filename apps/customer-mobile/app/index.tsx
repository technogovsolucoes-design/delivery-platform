import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { Tenant } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { categoryStyle, colors, radius, spacing, type } from "@/lib/theme";

export default function StoresScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Bebidas</Text>
        <Text style={styles.title}>O que vamos beber hoje?</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 48 }} />
      ) : stores.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🍹</Text>
          <Text style={styles.emptyTitle}>Nenhuma loja por aqui ainda</Text>
          <Text style={styles.emptyText}>Volte em breve — estamos cadastrando novas lojas.</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
          renderItem={({ item }) => {
            const { emoji, tint } = categoryStyle("cerveja");
            return (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(`/loja/${item.id}`)}
              >
                <View style={[styles.storeIcon, { backgroundColor: tint }]}>
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardMeta}>{item.address.neighborhood}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  eyebrow: { color: colors.accent, ...type.caption, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  title: { color: colors.textPrimary, ...type.h1 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 64, paddingHorizontal: spacing.xl },
  emptyTitle: { color: colors.textPrimary, ...type.h2, marginBottom: spacing.xs },
  emptyText: { color: colors.textSecondary, ...type.body, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: { opacity: 0.7 },
  storeIcon: { width: 56, height: 56, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: colors.textPrimary, ...type.bodyBold, marginBottom: 2 },
  cardMeta: { color: colors.textSecondary, ...type.small },
  chevron: { color: colors.textMuted, fontSize: 24, fontWeight: "300" },
});
