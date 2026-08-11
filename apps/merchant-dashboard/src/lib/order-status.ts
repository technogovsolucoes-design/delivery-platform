import type { OrderStatus } from "@delivery/shared-types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  confirmed: "Confirmado",
  preparing: "Preparando",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const FLOW: OrderStatus[] = ["pending_payment", "confirmed", "preparing", "out_for_delivery", "delivered"];

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = FLOW.indexOf(status);
  if (index === -1 || index === FLOW.length - 1) return null;
  return FLOW[index + 1] ?? null;
}

export function canCancel(status: OrderStatus): boolean {
  return status !== "delivered" && status !== "cancelled";
}
