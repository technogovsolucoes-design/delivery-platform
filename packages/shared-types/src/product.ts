export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  category: string;
  active: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: number;
  updatedAt: number;
}
