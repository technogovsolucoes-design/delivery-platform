import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { UserAddress, UserProfile } from "@delivery/shared-types";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { colors, gradients, radius, spacing, type } from "@/lib/theme";
import { AddressForm, EMPTY_ADDRESS } from "@/components/AddressForm";

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<UserAddress>(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      const profile = snap.data() as UserProfile | undefined;
      if (profile) {
        setName(profile.displayName);
        setPhone(profile.phone ?? "");
        setAddress(profile.address ?? EMPTY_ADDRESS);
      }
      setLoading(false);
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name });
      await setDoc(
        doc(db, "users", user.uid),
        {
          id: user.uid,
          email: user.email ?? "",
          displayName: name,
          phone,
          address,
          updatedAt: Date.now(),
        } satisfies Omit<UserProfile, "createdAt"> & { updatedAt: number },
        { merge: true }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl }}
    >
      <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginBottom: spacing.lg }}>
        <Text style={styles.back}>‹ Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Meu perfil</Text>

      <Text style={styles.label}>Nome completo</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.sectionTitle}>Endereço de entrega</Text>
      <AddressForm value={address} onChange={setAddress} />

      {error && <Text style={styles.error}>{error}</Text>}
      {saved && <Text style={styles.success}>Perfil atualizado!</Text>}

      <Pressable onPress={handleSave} disabled={saving}>
        <LinearGradient colors={gradients.gold} style={styles.button}>
          {saving ? <ActivityIndicator color="#17110A" /> : <Text style={styles.buttonText}>Salvar alterações</Text>}
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  back: { color: colors.textSecondary, ...type.body },
  title: { color: colors.textPrimary, ...type.h1, marginBottom: spacing.lg },
  sectionTitle: { color: colors.textPrimary, ...type.h2, marginTop: spacing.lg, marginBottom: spacing.md },
  label: {
    color: colors.textSecondary,
    ...type.caption,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    ...type.body,
  },
  error: { color: colors.danger, ...type.small, marginBottom: spacing.md },
  success: { color: colors.success, ...type.small, marginBottom: spacing.md },
  button: { borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
  buttonText: { color: "#17110A", ...type.bodyBold },
});
