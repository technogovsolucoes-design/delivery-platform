import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { colors, radius, spacing, type } from "@/lib/theme";
import logo from "../assets/images/logo.png";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Bem-vindo de volta</Text>
      <Text style={styles.subtitle}>Entre para pedir suas bebidas</Text>

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
      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
      </Pressable>

      <Pressable style={styles.linkRow} onPress={() => router.push("/cadastro")}>
        <Text style={styles.linkText}>
          Não tem conta? <Text style={styles.linkTextBold}>Criar conta</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  logo: { width: 92, height: 92, alignSelf: "center", marginBottom: spacing.lg, borderRadius: radius.lg },
  title: { color: colors.textPrimary, ...type.h1, textAlign: "center", marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, ...type.body, textAlign: "center", marginBottom: spacing.xl },
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
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonText: { color: colors.white, ...type.bodyBold },
  linkRow: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.textSecondary, ...type.small },
  linkTextBold: { color: colors.accent, fontWeight: "700" },
});
