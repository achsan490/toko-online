import fs from "fs";
import path from "path";
import { Category, Product, Order, StoreSettings } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "store.json");

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-beras",
    name: "Beras & Biji-bijian",
    slug: "beras-biji-bijian",
    icon: "🌾",
    description: "Beras premium, pulen, wangi dan beras ketan",
    order: 1,
  },
  {
    id: "cat-minyak",
    name: "Minyak & Margarin",
    slug: "minyak-margarin",
    icon: "🍳",
    description: "Minyak goreng kemasan pouch, jerigen, dan mentega",
    order: 2,
  },
  {
    id: "cat-gula-bumbu",
    name: "Gula & Bumbu Dapur",
    slug: "gula-bumbu-dapur",
    icon: "🧂",
    description: "Gula pasir, garam beryodium, kecap, dan bumbu masak",
    order: 3,
  },
  {
    id: "cat-telur-susu",
    name: "Telur & Susu",
    slug: "telur-susu",
    icon: "🥚",
    description: "Telur ayam negeri segar dan aneka susu kental manis",
    order: 4,
  },
  {
    id: "cat-mie",
    name: "Mie Instan & Bihun",
    slug: "mie-instan-bihun",
    icon: "🍜",
    description: "Indomie, mie kuah, mie goreng, bihun, dan pasta",
    order: 5,
  },
  {
    id: "cat-tepung",
    name: "Tepung & Olahan",
    slug: "tepung-olahan",
    icon: "🥐",
    description: "Tepung terigu, tapioka, beras, dan maizena",
    order: 6,
  },
  {
    id: "cat-minuman",
    name: "Kopi, Teh & Minuman",
    slug: "kopi-teh-minuman",
    icon: "☕",
    description: "Kopi renceng, teh celup, sirup, dan air mineral",
    order: 7,
  },
  {
    id: "cat-sabun",
    name: "Sabun & Kebersihan",
    slug: "sabun-kebersihan",
    icon: "🧼",
    description: "Sabun cuci piring, deterjen pakaian, dan pembersih lantai",
    order: 8,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-bimoli-2l",
    name: "Minyak Goreng Bimoli Klasik 2 Liter Pouch",
    slug: "minyak-goreng-bimoli-2-liter",
    categoryId: "cat-minyak",
    description: "Minyak goreng kelapa sawit murni berkualitas tinggi. Diproses dari kelapa sawit pilihan.",
    unit: "pouch",
    regularPrice: 38000,
    originalPrice: 40000,
    stock: 120,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    tierPrices: [
      { id: "tp-b-1", minQty: 2, maxQty: 5, price: 36500, label: "Grosir 2-5 Pouch" },
      { id: "tp-b-2", minQty: 6, maxQty: null, price: 35000, label: "Grosir Dus (≥ 6 Pouch)" },
    ],
    isActive: true,
    isFeatured: true,
    minOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-beras-setra-5kg",
    name: "Beras Premium Setra Ramos 5 Kg Pulen & Bersih",
    slug: "beras-premium-setra-ramos-5kg",
    categoryId: "cat-beras",
    description: "Beras putih premium kualitas super, bebas pengawet dan pemutih. Nasi pulen dan harum.",
    unit: "sak",
    regularPrice: 75000,
    originalPrice: 78000,
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    tierPrices: [
      { id: "tp-r-1", minQty: 2, maxQty: 4, price: 72000, label: "Grosir 2-4 Sak" },
      { id: "tp-r-2", minQty: 5, maxQty: null, price: 69000, label: "Grosir Partai (≥ 5 Sak)" },
    ],
    isActive: true,
    isFeatured: true,
    minOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-gulaku-1kg",
    name: "Gula Pasir Gulaku Premium Kuning 1 Kg",
    slug: "gula-pasir-gulaku-premium-1kg",
    categoryId: "cat-gula-bumbu",
    description: "Gula tebu alami kristal putih higienis dengan rasa manis alami.",
    unit: "bks",
    regularPrice: 18500,
    originalPrice: null,
    stock: 200,
    imageUrl: "https://images.unsplash.com/photo-1622484216850-25215c0e7d56?w=600&auto=format&fit=crop&q=80",
    tierPrices: [
      { id: "tp-g-1", minQty: 3, maxQty: 9, price: 17500, label: "Grosir 3-9 Bungkus" },
      { id: "tp-g-2", minQty: 10, maxQty: null, price: 16800, label: "Grosir Karung (≥ 10 Bungkus)" },
    ],
    isActive: true,
    isFeatured: true,
    minOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-telur-ayam-1kg",
    name: "Telur Ayam Negeri Fresh Pilihan 1 Kg",
    slug: "telur-ayam-negeri-fresh-1kg",
    categoryId: "cat-telur-susu",
    description: "Telur ayam ras segar langsung dari peternakan terpercaya.",
    unit: "kg",
    regularPrice: 28000,
    originalPrice: 30000,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80",
    tierPrices: [
      { id: "tp-t-1", minQty: 2, maxQty: 4, price: 26500, label: "Grosir 2-4 Kg" },
      { id: "tp-t-2", minQty: 5, maxQty: null, price: 25000, label: "Grosir Peti (≥ 5 Kg)" },
    ],
    isActive: true,
    isFeatured: true,
    minOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-indomie-goreng",
    name: "Indomie Goreng Spesial Original 85g",
    slug: "indomie-goreng-spesial-85g",
    categoryId: "cat-mie",
    description: "Mie instan goreng favorit masyarakat Indonesia dengan bumbu gurih khas.",
    unit: "pcs",
    regularPrice: 3500,
    originalPrice: null,
    stock: 450,
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80",
    tierPrices: [
      { id: "tp-i-1", minQty: 5, maxQty: 39, price: 3200, label: "Grosir Eceran (5 - 39 pcs)" },
      { id: "tp-i-2", minQty: 40, maxQty: null, price: 2950, label: "Grosir 1 Dus Karton (≥ 40 pcs)" },
    ],
    isActive: true,
    isFeatured: true,
    minOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: "Berkah Mart Sembako & Grosir",
  slogan: "Belanja Kebutuhan Pokok Harian, Makin Banyak Makin Murah!",
  whatsappNumber: "6281234567890",
  address: "Jl. Pasar Lama No. 45, RT 03/RW 02",
  city: "Jakarta Selatan",
  bankName: "BCA",
  bankAccount: "8830123456",
  bankHolder: "Toko Sembako Berkah",
  qrisImageUrl: "",
  deliveryFee: 10000,
  freeDeliveryMin: 150000,
  adminPin: "123456",
  heroBannerTitle: "Pusat Sembako Murah Eceran & Grosir",
  heroBannerSubtitle: "Harga khusus untuk warung, pedagang & kebutuhan harian keluarga.",
};

// Local JSON File Handler (Fallback)
function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: [],
      settings: INITIAL_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    const initialData: DatabaseSchema = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: [],
      settings: INITIAL_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

function saveDb(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Convert Supabase row to Product model
function mapSupabaseProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    description: row.description || "",
    unit: row.unit || "pcs",
    regularPrice: Number(row.regular_price),
    originalPrice: row.original_price ? Number(row.original_price) : null,
    stock: Number(row.stock),
    imageUrl: row.image_url || "",
    tierPrices: Array.isArray(row.tier_prices) ? row.tier_prices : [],
    isActive: row.is_active,
    isFeatured: row.is_featured,
    minOrder: row.min_order || 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert Product to Supabase row
function mapProductToSupabase(p: Product) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.categoryId,
    description: p.description,
    unit: p.unit,
    regular_price: p.regularPrice,
    original_price: p.originalPrice,
    stock: p.stock,
    image_url: p.imageUrl,
    tier_prices: p.tierPrices,
    is_active: p.isActive,
    is_featured: p.isFeatured,
    min_order: p.minOrder,
    updated_at: new Date().toISOString(),
  };
}

// Convert Supabase row to Order
function mapSupabaseOrder(row: any): Order {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address || "",
    notes: row.notes || "",
    deliveryMethod: row.delivery_method,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    totalAmount: Number(row.total_amount),
    totalSavings: Number(row.total_savings),
    trackingNumber: row.tracking_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Data Access Layer: Supports both Supabase (Cloud) and Local JSON (Fallback)
export const db = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("categories").select("*").order("order", { ascending: true });
        if (!error && data && data.length > 0) return data as Category[];
      } catch (err) {
        console.error("Supabase error fetching categories:", err);
      }
    }
    const local = ensureDbFile();
    return local.categories.sort((a, b) => a.order - b.order);
  },

  getCategoryById: async (id: string): Promise<Category | undefined> => {
    const categories = await db.getCategories();
    return categories.find((c) => c.id === id);
  },

  saveCategory: async (category: Category): Promise<Category> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("categories").upsert({
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          description: category.description,
          order: category.order,
        });
        return category;
      } catch (err) {
        console.error("Supabase error saving category:", err);
      }
    }
    const local = ensureDbFile();
    const index = local.categories.findIndex((c) => c.id === category.id);
    if (index >= 0) local.categories[index] = category;
    else local.categories.push(category);
    saveDb(local);
    return category;
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase error deleting category:", err);
      }
    }
    const local = ensureDbFile();
    const initLen = local.categories.length;
    local.categories = local.categories.filter((c) => c.id !== id);
    if (local.categories.length !== initLen) {
      saveDb(local);
      return true;
    }
    return false;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapSupabaseProduct);
        }
      } catch (err) {
        console.error("Supabase error fetching products:", err);
      }
    }
    const local = ensureDbFile();
    return local.products;
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
        if (!error && data) return mapSupabaseProduct(data);
      } catch (err) {
        console.error("Supabase error fetching product by id:", err);
      }
    }
    const local = ensureDbFile();
    return local.products.find((p) => p.id === id);
  },

  saveProduct: async (product: Product): Promise<Product> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const row = mapProductToSupabase(product);
        await supabase.from("products").upsert(row);
        return product;
      } catch (err) {
        console.error("Supabase error saving product:", err);
      }
    }
    const local = ensureDbFile();
    const index = local.products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      local.products[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      local.products.unshift({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    saveDb(local);
    return product;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Supabase error deleting product:", err);
      }
    }
    const local = ensureDbFile();
    const initLen = local.products.length;
    local.products = local.products.filter((p) => p.id !== id);
    if (local.products.length !== initLen) {
      saveDb(local);
      return true;
    }
    return false;
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (!error && data) return data.map(mapSupabaseOrder);
      } catch (err) {
        console.error("Supabase error fetching orders:", err);
      }
    }
    const local = ensureDbFile();
    return local.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById: async (id: string): Promise<Order | undefined> => {
    const orders = await db.getOrders();
    return orders.find((o) => o.id === id);
  },

  createOrder: async (order: Order): Promise<Order> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("orders").insert({
          id: order.id,
          invoice_number: order.invoiceNumber,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_address: order.customerAddress,
          notes: order.notes,
          delivery_method: order.deliveryMethod,
          payment_method: order.paymentMethod,
          payment_status: order.paymentStatus,
          order_status: order.orderStatus,
          items: order.items,
          subtotal: order.subtotal,
          delivery_fee: order.deliveryFee,
          total_amount: order.totalAmount,
          total_savings: order.totalSavings,
          created_at: order.createdAt,
          updated_at: order.updatedAt,
        });

        // Deduct stock in Supabase
        for (const item of order.items) {
          const prod = await db.getProductById(item.productId);
          if (prod) {
            prod.stock = Math.max(0, prod.stock - item.quantity);
            await db.saveProduct(prod);
          }
        }

        return order;
      } catch (err) {
        console.error("Supabase error creating order:", err);
      }
    }

    const local = ensureDbFile();
    local.orders.unshift(order);
    for (const item of order.items) {
      const prod = local.products.find((p) => p.id === item.productId);
      if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
    }
    saveDb(local);
    return order;
  },

  updateOrder: async (id: string, updates: Partial<Order>): Promise<Order | null> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.orderStatus) payload.order_status = updates.orderStatus;
        if (updates.paymentStatus) payload.payment_status = updates.paymentStatus;
        if (updates.trackingNumber !== undefined) payload.tracking_number = updates.trackingNumber;

        const { data, error } = await supabase.from("orders").update(payload).eq("id", id).select().single();
        if (!error && data) return mapSupabaseOrder(data);
      } catch (err) {
        console.error("Supabase error updating order:", err);
      }
    }

    const local = ensureDbFile();
    const index = local.orders.findIndex((o) => o.id === id);
    if (index >= 0) {
      local.orders[index] = {
        ...local.orders[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveDb(local);
      return local.orders[index];
    }
    return null;
  },

  // Settings
  getSettings: async (): Promise<StoreSettings> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("settings").select("data").eq("id", "main").maybeSingle();
        if (!error && data?.data) return data.data as StoreSettings;
      } catch (err) {
        console.error("Supabase error fetching settings:", err);
      }
    }
    const local = ensureDbFile();
    return local.settings || INITIAL_SETTINGS;
  },

  updateSettings: async (updates: Partial<StoreSettings>): Promise<StoreSettings> => {
    const current = await db.getSettings();
    const updated = { ...current, ...updates };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("settings").upsert({
          id: "main",
          data: updated,
          updated_at: new Date().toISOString(),
        });
        return updated;
      } catch (err) {
        console.error("Supabase error updating settings:", err);
      }
    }

    const local = ensureDbFile();
    local.settings = updated;
    saveDb(local);
    return updated;
  },
};
