import type { OrderStatus } from "@delivery/shared-types";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge badge-${status}`}>{ORDER_STATUS_LABEL[status]}</span>;
}
