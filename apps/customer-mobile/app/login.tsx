import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { colors, gradients, radius, spacing, type } from "@/lib/theme";
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
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <View style={{ paddingTop: insets.top + spacing.xxl, paddingHorizontal: spacing.xl, flex: 1 }}>
        <LinearGradient colors={gradients.gold} style={styles.logoBadge}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </LinearGradient>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entre para pedir suas bebidas</Text>

        <View style={styles.card}>
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

          <Pressable onPress={handleLogin} disabled={submitting}>
            <LinearGradient colors={gradients.gold} style={styles.button}>
              {submitting ? <ActivityIndicator color="#17110A" /> : <Text style={styles.buttonText}>Entrar</Text>}
            </LinearGradient>
          </Pressable>
        </View>

        <Pressable style={styles.linkRow} onPress={() => router.push("/cadastro")}>
          <Text style={styles.linkText}>
            Não tem conta? <Text style={styles.linkTextBold}>Criar conta</Text>
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  logo: { width: 52, height: 52, borderRadius: radius.md },
  title: { color: colors.textPrimary, ...type.h1, textAlign: "center", marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, ...type.body, textAlign: "center", marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    ...type.caption,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgElevated,
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
  buttonText: { color: "#17110A", ...type.bodyBold },
  linkRow: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.textSecondary, ...type.small },
  linkTextBold: { color: colors.goldLight, fontFamily: type.bodyBold.fontFamily, fontWeight: type.bodyBold.fontWeight },
});
