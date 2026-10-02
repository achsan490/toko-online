-- ====================================================
-- SKEMA DATABASE TOKO SEMBAKO & MINIMARKET GROSIR
-- Jalankan script ini di menu "SQL Editor" di dashboard Supabase Anda
-- ====================================================

-- 1. Tabel Kategori Sembako
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  description TEXT,
  "order" INTEGER DEFAULT 1
);

-- 2. Tabel Produk Sembako & Harga Grosir
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  unit TEXT DEFAULT 'pcs',
  regular_price INTEGER NOT NULL,
  original_price INTEGER,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  tier_prices JSONB DEFAULT '[]'::jsonb, -- Array harga grosir bertingkat
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  min_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Pesanan Pelanggan (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  notes TEXT,
  delivery_method TEXT DEFAULT 'DELIVERY',
  payment_method TEXT DEFAULT 'WHATSAPP',
  payment_status TEXT DEFAULT 'UNPAID',
  order_status TEXT DEFAULT 'PENDING',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal INTEGER DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  total_savings INTEGER DEFAULT 0,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Pengaturan Toko & Kontak
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================
-- SEED DATA AWAL (KATEGORI, PRODUK & PENGATURAN TOKO)
-- ====================================================

-- Masukkan Kategori Awal
INSERT INTO categories (id, name, slug, icon, description, "order") VALUES
('cat-beras', 'Beras & Biji-bijian', 'beras-biji-bijian', '🌾', 'Beras premium, pulen, wangi dan beras ketan', 1),
('cat-minyak', 'Minyak & Margarin', 'minyak-margarin', '🍳', 'Minyak goreng kemasan pouch, jerigen, dan mentega', 2),
('cat-gula-bumbu', 'Gula & Bumbu Dapur', 'gula-bumbu-dapur', '🧂', 'Gula pasir, garam beryodium, kecap, dan bumbu masak', 3),
('cat-telur-susu', 'Telur & Susu', 'telur-susu', '🥚', 'Telur ayam negeri segar dan aneka susu kental manis', 4),
('cat-mie', 'Mie Instan & Bihun', 'mie-instan-bihun', '🍜', 'Indomie, mie kuah, mie goreng, bihun, dan pasta', 5),
('cat-tepung', 'Tepung & Olahan', 'tepung-olahan', '🥐', 'Tepung terigu, tapioka, beras, dan maizena', 6),
('cat-minuman', 'Kopi, Teh & Minuman', 'kopi-teh-minuman', '☕', 'Kopi renceng, teh celup, sirup, dan air mineral', 7),
('cat-sabun', 'Sabun & Kebersihan', 'sabun-kebersihan', '🧼', 'Sabun cuci piring, deterjen pakaian, dan pembersih lantai', 8)
ON CONFLICT (id) DO NOTHING;

-- Masukkan Produk Awal dengan Harga Grosir Bertingkat
INSERT INTO products (id, name, slug, category_id, description, unit, regular_price, original_price, stock, image_url, tier_prices, is_active, is_featured, min_order) VALUES
('prod-bimoli-2l', 'Minyak Goreng Bimoli Klasik 2 Liter Pouch', 'minyak-goreng-bimoli-2-liter', 'cat-minyak', 'Minyak goreng kelapa sawit murni berkualitas tinggi.', 'pouch', 38000, 40000, 120, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', '[{"id":"tp-1","minQty":2,"maxQty":5,"price":36500,"label":"Grosir 2-5 Pouch"},{"id":"tp-2","minQty":6,"maxQty":null,"price":35000,"label":"Grosir Dus (≥ 6 Pouch)"}]'::jsonb, true, true, 1),
('prod-beras-setra-5kg', 'Beras Premium Setra Ramos 5 Kg Pulen & Bersih', 'beras-premium-setra-ramos-5kg', 'cat-beras', 'Beras putih premium kualitas super, bebas pengawet dan pemutih.', 'sak', 75000, 78000, 80, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', '[{"id":"tp-3","minQty":2,"maxQty":4,"price":72000,"label":"Grosir 2-4 Sak"},{"id":"tp-4","minQty":5,"maxQty":null,"price":69000,"label":"Grosir Partai (≥ 5 Sak)"}]'::jsonb, true, true, 1),
('prod-gulaku-1kg', 'Gula Pasir Gulaku Premium Kuning 1 Kg', 'gula-pasir-gulaku-premium-1kg', 'cat-gula-bumbu', 'Gula tebu alami kristal putih higienis dengan rasa manis alami.', 'bks', 18500, null, 200, 'https://images.unsplash.com/photo-1622484216850-25215c0e7d56?w=600&auto=format&fit=crop&q=80', '[{"id":"tp-5","minQty":3,"maxQty":9,"price":17500,"label":"Grosir 3-9 Bungkus"},{"id":"tp-6","minQty":10,"maxQty":null,"price":16800,"label":"Grosir Karung (≥ 10 Bungkus)"}]'::jsonb, true, true, 1),
('prod-telur-ayam-1kg', 'Telur Ayam Negeri Fresh Pilihan 1 Kg', 'telur-ayam-negeri-fresh-1kg', 'cat-telur-susu', 'Telur ayam ras segar langsung dari peternakan terpercaya.', 'kg', 28000, 30000, 50, 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80', '[{"id":"tp-7","minQty":2,"maxQty":4,"price":26500,"label":"Grosir 2-4 Kg"},{"id":"tp-8","minQty":5,"maxQty":null,"price":25000,"label":"Grosir Peti (≥ 5 Kg)"}]'::jsonb, true, true, 1),
('prod-indomie-goreng', 'Indomie Goreng Spesial Original 85g', 'indomie-goreng-spesial-85g', 'cat-mie', 'Mie instan goreng favorit masyarakat Indonesia dengan taburan bawang goreng.', 'pcs', 3500, null, 450, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80', '[{"id":"tp-9","minQty":5,"maxQty":39,"price":3200,"label":"Grosir Eceran (5 - 39 pcs)"},{"id":"tp-10","minQty":40,"maxQty":null,"price":2950,"label":"Grosir 1 Dus Karton (≥ 40 pcs)"}]'::jsonb, true, true, 1)
ON CONFLICT (id) DO NOTHING;

-- Masukkan Pengaturan Awal Toko
INSERT INTO settings (id, data) VALUES (
  'main',
  '{
    "storeName": "Berkah Mart Sembako & Grosir",
    "slogan": "Belanja Kebutuhan Pokok Harian, Makin Banyak Makin Murah!",
    "whatsappNumber": "6281234567890",
    "address": "Jl. Pasar Lama No. 45, RT 03/RW 02",
    "city": "Jakarta Selatan",
    "bankName": "BCA",
    "bankAccount": "8830123456",
    "bankHolder": "Toko Sembako Berkah",
    "qrisImageUrl": "",
    "deliveryFee": 10000,
    "freeDeliveryMin": 150000,
    "adminPin": "123456",
    "heroBannerTitle": "Pusat Sembako Murah Eceran & Grosir",
    "heroBannerSubtitle": "Harga khusus untuk warung, pedagang & kebutuhan harian keluarga."
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Aktifkan Row Level Security (RLS) dan berikan izin akses publik anon
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);

CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON settings FOR ALL USING (true);
