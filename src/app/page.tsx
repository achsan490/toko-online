"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Product, Category, StoreSettings } from "@/types";
import { formatRupiah, calculateOrderItem } from "@/lib/pricing";
import { MessageCircle, Sparkles, AlertCircle } from "lucide-react";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "Berkah Mart Sembako",
    slogan: "Belanja Kebutuhan Pokok Makin Banyak Makin Murah",
    whatsappNumber: "6281234567890",
    address: "Jl. Pasar Lama No. 45",
    city: "Jakarta",
    bankName: "BCA",
    bankAccount: "8830123456",
    bankHolder: "Toko Sembako Berkah",
    qrisImageUrl: "",
    deliveryFee: 10000,
    freeDeliveryMin: 150000,
    adminPin: "123456",
    heroBannerTitle: "Pusat Sembako Murah Eceran & Grosir",
    heroBannerSubtitle: "Beli 1 eceran, beli lebih dari 2 langsung dapat harga grosir murah! Sangat hemat untuk kebutuhan rumah tangga dan warung.",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cart State: { product, quantity }
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catRes, prodRes, setRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?activeOnly=true"),
          fetch("/api/settings"),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();
        const setData = await setRes.json();

        if (catData.success) setCategories(catData.data);
        if (prodData.success) setProducts(prodData.data);
        if (setData.success) setSettings(setData.data);
      } catch (err) {
        console.error("Failed to load initial storefront data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Restore saved cart from localStorage if exists
    try {
      const savedCart = localStorage.getItem("toko_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("toko_cart", JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.product.id === product.id);
      if (index >= 0) {
        const next = [...prev];
        next[index].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Direct WhatsApp single item purchase
  const handleDirectWhatsApp = (product: Product, quantity: number) => {
    const calculated = calculateOrderItem(product, quantity);
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, "");

    let msg = `Halo ${settings.storeName}, saya ingin memesan produk:\n\n`;
    msg += `*${product.name}*\n`;
    msg += `Jumlah: ${quantity} ${product.unit}\n`;
    msg += `Harga Satuan: ${formatRupiah(calculated.priceApplied)}${calculated.tierLabel ? ` (${calculated.tierLabel})` : ""}\n`;
    msg += `*Total: ${formatRupiah(calculated.subtotal)}*\n`;
    if (calculated.savings > 0) {
      msg += `🎉 Hemat Grosir: ${formatRupiah(calculated.savings)}\n`;
    }
    msg += `\nApakah stok masih tersedia? Terima kasih!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate cart counts & total
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => {
    const calculated = calculateOrderItem(item.product, item.quantity);
    return acc + calculated.subtotal;
  }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        storeName={settings.storeName}
      />

      <main style={{ flexGrow: 1, paddingBottom: "3rem" }}>
        {/* Hero Banner */}
        <HeroBanner settings={settings} />

        <div className="container">
          {/* Section: Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Section Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                {selectedCategory === "all"
                  ? "Semua Produk Sembako"
                  : categories.find((c) => c.id === selectedCategory)?.name || "Kategori"}
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Menampilkan {filteredProducts.length} produk pilihan berkualitas
              </span>
            </div>

            {searchQuery && (
              <div
                style={{
                  fontSize: "0.85rem",
                  backgroundColor: "var(--bg-muted)",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                Pencarian: &quot;<strong>{searchQuery}</strong>&quot;
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ marginLeft: "0.5rem", color: "var(--danger)", fontWeight: 700 }}
                >
                  × Hapus
                </button>
              </div>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    height: "280px",
                    backgroundColor: "#f8fafc",
                    animation: "pulseGlow 1.5s infinite ease-in-out",
                  }}
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 1rem",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Produk Tidak Ditemukan</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Tidak ada produk yang cocok dengan pencarian Anda. Coba kata kunci lain atau pilih kategori lain.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="btn btn-primary btn-sm"
              >
                Tampilkan Semua Produk
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onDirectWhatsApp={handleDirectWhatsApp}
                  onViewDetail={setSelectedProductDetail}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=Halo%20Admin%20${encodeURIComponent(settings.storeName)},%20saya%20mau%20tanya%20produk%20sembako`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          backgroundColor: "var(--wa-green)",
          color: "#ffffff",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 16px rgba(37, 211, 102, 0.4)",
          zIndex: 40,
          transition: "transform 0.2s ease",
        }}
        title="Chat Langsung di WhatsApp"
      >
        <MessageCircle size={30} />
      </a>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
        onDirectWhatsApp={handleDirectWhatsApp}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {/* Footer */}
      <Footer settings={settings} />
    </div>
  );
}
