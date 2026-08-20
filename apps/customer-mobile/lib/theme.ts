import { Platform } from "react-native";

export const colors = {
  bg: "#08090C",
  bgElevated: "#0D0F13",
  surface: "#15181D",
  surfaceRaised: "#1D2128",
  border: "#272C34",
  borderSoft: "#1C1E24",
  textPrimary: "#F7F5F0",
  textSecondary: "#A3A09A",
  textMuted: "#6B6963",
  // Gold trio, lifted straight from the mascot logo.
  goldLight: "#FFD166",
  accent: "#F0A202",
  goldDeep: "#C97B00",
  accentMuted: "#3D2E0A",
  success: "#2FD47A",
  danger: "#FF5C5C",
  white: "#FFFFFF",
};

// Gradient stop arrays for expo-linear-gradient, matching the logo's gold ramp.
export const gradients = {
  gold: [colors.goldLight, colors.accent, colors.goldDeep] as const,
  goldSoft: ["rgba(255,209,102,0.18)", "rgba(240,162,2,0.05)"] as const,
  hero: ["#1A1508", "#08090C"] as const,
  overlay: ["transparent", "rgba(8,9,12,0.9)"] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
};

// Native loads named font assets via useFonts; web gets the family from the
// Google Fonts <link> in app/+html.tsx and needs a plain family + numeric
// weight instead of per-weight synthetic names.
type FontWeight = "400" | "500" | "600" | "700" | "800";

function textStyle(weight: keyof typeof fonts, fontWeight: FontWeight, fontSize: number, letterSpacing?: number) {
  return Platform.OS === "web"
    ? { fontFamily: '"Plus Jakarta Sans", -apple-system, "Segoe UI", sans-serif', fontWeight, fontSize, letterSpacing }
    : { fontFamily: fonts[weight], fontSize, letterSpacing };
}

export const type = {
  h1: textStyle("extraBold", "800", 28, -0.6),
  h2: textStyle("bold", "700", 19, -0.3),
  body: textStyle("medium", "500", 15),
  bodyBold: textStyle("bold", "700", 15),
  small: textStyle("medium", "500", 13),
  caption: textStyle("semiBold", "600", 12),
};

interface CategoryStyle {
  emoji: string;
  tint: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  cerveja: { emoji: "🍺", tint: "#8A5A12" },
  vinho: { emoji: "🍷", tint: "#6B1F3D" },
  sem_alcool: { emoji: "💧", tint: "#1B5C91" },
  destilado: { emoji: "🥃", tint: "#5B2C6F" },
  geral: { emoji: "🛒", tint: "#3A3F47" },
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.geral!;
}
