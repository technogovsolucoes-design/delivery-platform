import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@delivery/shared-types";

export interface CartItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

interface CartState {
  tenantId: string | null;
  items: CartItem[];
  subtotalCents: number;
  addItem: (tenantId: string, product: Product) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);

// An order can only hold products from one store — the caller (store screen) is
// responsible for confirming with the user before adding a product from a different
// tenant than what's already in the cart.
export function CartProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(nextTenantId: string, product: Product) {
    setItems((prev) => {
      const sameStore = tenantId === nextTenantId;
      const base = sameStore ? prev : [];
      const existing = base.find((item) => item.productId === product.id);
      if (existing) {
        return base.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...base,
        { productId: product.id, name: product.name, unitPriceCents: product.priceCents, quantity: 1 },
      ];
    });
    setTenantId(nextTenantId);
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  }

  function clear() {
    setItems([]);
    setTenantId(null);
  }

  const subtotalCents = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ tenantId, items, subtotalCents, addItem, removeItem, setQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
