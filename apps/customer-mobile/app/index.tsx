import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { Tenant } from "@delivery/shared-types";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { categoryStyle, colors, radius, spacing, type } from "@/lib/theme";
import logo from "../assets/images/logo.png";

export default function StoresScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const [stores, setStores] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

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

  if (authLoading || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.brandName}>Tião Beer Delivery</Text>
            <Text style={styles.brandTagline}>Suas bebidas, onde você estiver!</Text>
          </View>
          <Pressable onPress={() => router.push("/pedidos")} hitSlop={12} style={{ marginRight: spacing.md }}>
            <Text style={styles.logout}>Pedidos</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/perfil")} hitSlop={12} style={{ marginRight: spacing.md }}>
            <Text style={styles.logout}>Perfil</Text>
          </Pressable>
          <Pressable onPress={() => signOut(auth)} hitSlop={12}>
            <Text style={styles.logout}>Sair</Text>
          </Pressable>
        </View>
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
  centered: { alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  logo: { width: 40, height: 40, borderRadius: radius.sm },
  brandName: { color: colors.textPrimary, ...type.bodyBold, fontSize: 16 },
  brandTagline: { color: colors.textSecondary, ...type.caption, fontWeight: "500" },
  logout: { color: colors.textSecondary, ...type.small },
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
