export interface TierPrice {
  id: string;
  minQty: number;
  maxQty: number | null; // null means no upper limit (e.g. >= 10)
  price: number;
  label?: string; // e.g. "Grosir Dus", "Grosir Warung"
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // emoji or icon name
  description?: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  unit: string; // "pcs", "kg", "liter", "dus", "pak", "sak", "botol", "renceng"
  regularPrice: number; // eceran (1 pcs)
  originalPrice: number | null; // harga coret jika promo
  stock: number;
  imageUrl: string;
  tierPrices: TierPrice[];
  isActive: boolean;
  isFeatured: boolean;
  minOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  regularPrice: number;
  priceApplied: number; // wholesale price or regular
  tierLabel?: string;
  subtotal: number;
  savings: number; // savings per item line
  imageUrl?: string;
}

export interface Order {
  id: string;
  invoiceNumber: string; // e.g. INV-20261002-001
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  deliveryMethod: "DELIVERY" | "PICKUP";
  paymentMethod: "WHATSAPP" | "TRANSFER" | "QRIS" | "COD";
  paymentStatus: "UNPAID" | "PAID" | "VERIFIED";
  orderStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  totalSavings: number;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  whatsappNumber: string; // format with country code: 6281234567890
  address: string;
  city: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  qrisImageUrl: string;
  deliveryFee: number;
  freeDeliveryMin: number;
  adminPin: string;
  heroBannerTitle: string;
  heroBannerSubtitle: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
