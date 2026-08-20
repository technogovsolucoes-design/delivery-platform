import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { Tenant } from "@delivery/shared-types";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { categoryStyle, colors, gradients, radius, spacing, type } from "@/lib/theme";
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
    <View style={styles.container}>
      <LinearGradient colors={gradients.hero} style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandName}>Tião Beer Delivery</Text>
            <Text style={styles.brandTagline}>Suas bebidas, onde você estiver</Text>
          </View>
          <View style={styles.actionsRow}>
            <IconAction label="🧾" onPress={() => router.push("/pedidos")} />
            <IconAction label="👤" onPress={() => router.push("/perfil")} />
            <IconAction label="↩" onPress={() => signOut(auth)} />
          </View>
        </View>

        <View style={styles.eyebrow}>
          <Text style={styles.eyebrowText}>ENTREGA RÁPIDA</Text>
        </View>
        <Text style={styles.title}>O que vamos beber hoje?</Text>
        <Text style={styles.subtitle}>Escolha uma loja perto de você e monte seu pedido</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 48 }} />
      ) : stores.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient colors={gradients.gold} style={styles.emptyIcon}>
            <Text style={{ fontSize: 30 }}>🍹</Text>
          </LinearGradient>
          <Text style={styles.emptyTitle}>Nenhuma loja por aqui ainda</Text>
          <Text style={styles.emptyText}>Volte em breve — estamos cadastrando novas lojas.</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl }}
          renderItem={({ item }) => {
            const { emoji } = categoryStyle("cerveja");
            return (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(`/loja/${item.id}`)}
              >
                <LinearGradient colors={gradients.gold} style={styles.storeIcon}>
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardMeta}>{item.address.neighborhood}</Text>
                </View>
                <View style={styles.chevronBadge}>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

function IconAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => [styles.iconAction, pressed && { opacity: 0.6 }]}>
      <Text style={styles.iconActionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xl },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  logo: { width: 30, height: 30, borderRadius: radius.sm },
  brandName: { color: colors.textPrimary, ...type.bodyBold, fontSize: 16 },
  brandTagline: { color: colors.textSecondary, ...type.small },
  actionsRow: { flexDirection: "row", gap: spacing.xs },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconActionText: { fontSize: 14 },
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  eyebrowText: { color: colors.goldLight, ...type.caption, letterSpacing: 0.6 },
  title: { color: colors.textPrimary, ...type.h1, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, ...type.body },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 64, paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
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
    borderColor: colors.borderSoft,
  },
  cardPressed: { opacity: 0.7 },
  storeIcon: { width: 56, height: 56, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: colors.textPrimary, ...type.bodyBold, marginBottom: 2 },
  cardMeta: { color: colors.textSecondary, ...type.small },
  chevronBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: { color: colors.textMuted, fontSize: 18, fontWeight: "300" },
});
