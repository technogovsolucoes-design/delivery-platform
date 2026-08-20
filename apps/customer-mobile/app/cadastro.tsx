import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import type { UserAddress, UserProfile } from "@delivery/shared-types";
import { auth, db } from "@/lib/firebase";
import { colors, gradients, radius, spacing, type } from "@/lib/theme";
import { AddressForm, EMPTY_ADDRESS } from "@/components/AddressForm";

export default function CadastroScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState<UserAddress>(EMPTY_ADDRESS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addressComplete = Boolean(
    address.cep && address.street && address.number && address.neighborhood && address.city && address.state
  );
  const canSubmit = Boolean(name && email && phone && password && password === confirmPassword && addressComplete);

  async function handleSubmit() {
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });

      const now = Date.now();
      const profile: UserProfile = {
        id: credential.user.uid,
        email,
        displayName: name,
        phone,
        address,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, "users", credential.user.uid), profile);

      router.replace("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("Esse e-mail já está cadastrado.");
      } else if (code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else {
        setError("Não foi possível criar sua conta. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    >
      <LinearGradient colors={gradients.hero} style={{ paddingHorizontal: spacing.xl, paddingTop: insets.top + spacing.xl, paddingBottom: spacing.xl }}>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Leva menos de um minuto</Text>
      </LinearGradient>

      <View style={{ padding: spacing.xl, paddingTop: spacing.lg }}>
      <Text style={styles.label}>Nome completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu nome"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="voce@exemplo.com"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        placeholder="(11) 99999-9999"
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.label}>Confirmar senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Repita a senha"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Text style={styles.sectionTitle}>Endereço de entrega</Text>
      <AddressForm value={address} onChange={setAddress} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable onPress={handleSubmit} disabled={!canSubmit || submitting} style={!canSubmit && styles.buttonDisabled}>
        <LinearGradient colors={gradients.gold} style={styles.button}>
          {submitting ? <ActivityIndicator color="#17110A" /> : <Text style={styles.buttonText}>Criar conta</Text>}
        </LinearGradient>
      </Pressable>

      <Pressable style={styles.linkRow} onPress={() => router.back()}>
        <Text style={styles.linkText}>
          Já tem conta? <Text style={styles.linkTextBold}>Entrar</Text>
        </Text>
      </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.textPrimary, ...type.h1, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, ...type.body, marginBottom: spacing.xl },
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
  button: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#17110A", ...type.bodyBold },
  linkRow: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.textSecondary, ...type.small },
  linkTextBold: { color: colors.goldLight, fontFamily: type.bodyBold.fontFamily },
});
