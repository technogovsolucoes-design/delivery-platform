import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import type { UserAddress } from "@delivery/shared-types";
import { formatCep, lookupCep } from "@/lib/cep";
import { colors, radius, spacing, type } from "@/lib/theme";

export const EMPTY_ADDRESS: UserAddress = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

interface AddressFormProps {
  value: UserAddress;
  onChange: (value: UserAddress) => void;
}

export function AddressForm({ value, onChange }: AddressFormProps) {
  const [looking, setLooking] = useState(false);
  const [notFound, setNotFound] = useState(false);

  function set<K extends keyof UserAddress>(key: K, val: UserAddress[K]) {
    onChange({ ...value, [key]: val });
  }

  async function handleCepChange(raw: string) {
    const formatted = formatCep(raw);
    set("cep", formatted);
    setNotFound(false);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setLooking(true);
    try {
      const result = await lookupCep(digits);
      if (!result) {
        setNotFound(true);
        return;
      }
      onChange({
        ...value,
        cep: formatCep(result.cep),
        street: result.street,
        neighborhood: result.neighborhood,
        city: result.city,
        state: result.state,
      });
    } finally {
      setLooking(false);
    }
  }

  return (
    <View>
      <Text style={styles.label}>CEP</Text>
      <View style={styles.cepRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="00000-000"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={value.cep}
          onChangeText={handleCepChange}
          maxLength={9}
        />
        {looking && <ActivityIndicator color={colors.accent} style={{ marginLeft: spacing.sm }} />}
      </View>
      {notFound && <Text style={styles.error}>CEP não encontrado — preencha manualmente.</Text>}
      <View style={{ height: spacing.md }} />

      <Text style={styles.label}>Rua</Text>
      <TextInput
        style={styles.input}
        placeholder="Rua"
        placeholderTextColor={colors.textMuted}
        value={value.street}
        onChangeText={(v) => set("street", v)}
      />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            style={styles.input}
            placeholder="Nº"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={value.number}
            onChangeText={(v) => set("number", v)}
          />
        </View>
        <View style={{ flex: 2 }}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput
            style={styles.input}
            placeholder="Apto, bloco... (opcional)"
            placeholderTextColor={colors.textMuted}
            value={value.complement}
            onChangeText={(v) => set("complement", v)}
          />
        </View>
      </View>

      <Text style={styles.label}>Bairro</Text>
      <TextInput
        style={styles.input}
        placeholder="Bairro"
        placeholderTextColor={colors.textMuted}
        value={value.neighborhood}
        onChangeText={(v) => set("neighborhood", v)}
      />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <View style={{ flex: 2 }}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            placeholderTextColor={colors.textMuted}
            value={value.city}
            onChangeText={(v) => set("city", v)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>UF</Text>
          <TextInput
            style={styles.input}
            placeholder="UF"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            maxLength={2}
            value={value.state}
            onChangeText={(v) => set("state", v.toUpperCase())}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  cepRow: { flexDirection: "row", alignItems: "center" },
  error: { color: colors.danger, ...type.small, marginTop: spacing.xs },
});
