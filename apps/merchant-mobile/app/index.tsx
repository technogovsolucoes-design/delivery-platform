import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/pedidos");
    } catch {
      setError("Não foi possível entrar. Verifique o e-mail e a senha.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Lojista</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#9aa1ab"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9aa1ab"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0d10", justifyContent: "center", padding: 24 },
  title: { color: "#e8eaed", fontSize: 24, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  input: {
    backgroundColor: "#14171b",
    borderColor: "#23272e",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "#e8eaed",
    marginBottom: 12,
  },
  error: { color: "#ff6b6b", fontSize: 13, marginBottom: 12 },
  button: { backgroundColor: "#4f8cff", borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
