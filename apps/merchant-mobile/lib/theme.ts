export const colors = {
  bg: "#0B0D10",
  surface: "#15181D",
  surfaceRaised: "#1D2128",
  border: "#272C34",
  textPrimary: "#F3F4F6",
  textSecondary: "#9AA3AE",
  textMuted: "#6B7280",
  accent: "#FF6B35",
  accentMuted: "#4A2A1A",
  success: "#33D17A",
  successMuted: "#143324",
  warning: "#F5A623",
  warningMuted: "#3A2C0E",
  danger: "#FF5C5C",
  dangerMuted: "#3A1A1A",
  info: "#4F8CFF",
  infoMuted: "#182842",
  white: "#FFFFFF",
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

export const type = {
  h1: { fontSize: 26, fontWeight: "800" as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
  body: { fontSize: 15, fontWeight: "500" as const },
  bodyBold: { fontSize: 15, fontWeight: "700" as const },
  small: { fontSize: 13, fontWeight: "500" as const },
  caption: { fontSize: 12, fontWeight: "600" as const },
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
