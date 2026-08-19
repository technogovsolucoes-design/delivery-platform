export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded";

export interface OrderItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface OrderPayment {
  provider: "mercado_pago";
  preferenceId: string | null;
  paymentId: string | null;
  status: PaymentStatus;
  /** Amount retained by the platform as commission, in cents. */
  platformFeeCents: number;
}

export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  /** Denormalized from the customer's profile at order creation — tenant staff can't read
   *  other users' profile docs, so the order itself is how a "Clientes" view gets a name/email. */
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  payment: OrderPayment;
  deliveryAddress: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    lat: number;
    lng: number;
  };
  createdAt: number;
  updatedAt: number;
}
