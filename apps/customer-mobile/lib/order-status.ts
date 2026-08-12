import type { OrderStatus } from "@delivery/shared-types";
import { colors } from "./theme";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  confirmed: "Confirmado",
  preparing: "Preparando",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_TINT: Record<OrderStatus, { bg: string; fg: string }> = {
  pending_payment: { bg: colors.accentMuted, fg: colors.accent },
  confirmed: { bg: "#182842", fg: "#4F8CFF" },
  preparing: { bg: colors.accentMuted, fg: colors.accent },
  out_for_delivery: { bg: "#2A1D42", fg: "#B98CFF" },
  delivered: { bg: "#143324", fg: colors.success },
  cancelled: { bg: "#3A1A1A", fg: colors.danger },
};

export function statusTint(status: OrderStatus): { bg: string; fg: string } {
  return STATUS_TINT[status];
}
