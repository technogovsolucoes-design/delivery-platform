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
  successMuted: "#123424",
  warning: "#F5A623",
  warningMuted: "#3A2C0E",
  danger: "#FF5C5C",
  dangerMuted: "#3A1A1A",
  info: "#4F8CFF",
  infoMuted: "#182842",
  white: "#FFFFFF",
};

export const gradients = {
  gold: [colors.goldLight, colors.accent, colors.goldDeep] as const,
  goldSoft: ["rgba(255,209,102,0.18)", "rgba(240,162,2,0.05)"] as const,
  hero: ["#1A1508", "#08090C"] as const,
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

export const type = {
  h1: { fontSize: 28, fontFamily: fonts.extraBold, letterSpacing: -0.6 },
  h2: { fontSize: 19, fontFamily: fonts.bold, letterSpacing: -0.3 },
  body: { fontSize: 15, fontFamily: fonts.medium },
  bodyBold: { fontSize: 15, fontFamily: fonts.bold },
  small: { fontSize: 13, fontFamily: fonts.medium },
  caption: { fontSize: 12, fontFamily: fonts.semiBold },
};

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  pending_payment: { bg: colors.warningMuted, fg: colors.warning },
  confirmed: { bg: colors.infoMuted, fg: colors.info },
  preparing: { bg: colors.accentMuted, fg: colors.accent },
  out_for_delivery: { bg: "#2A1D42", fg: "#B98CFF" },
  delivered: { bg: colors.successMuted, fg: colors.success },
  cancelled: { bg: colors.dangerMuted, fg: colors.danger },
};

export function statusTint(status: string): { bg: string; fg: string } {
  return STATUS_TINT[status] ?? { bg: colors.surfaceRaised, fg: colors.textSecondary };
}

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
