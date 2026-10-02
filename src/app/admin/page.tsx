"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Product,
  Category,
  Order,
  StoreSettings,
  TierPrice,
} from "@/types";
import { formatRupiah } from "@/lib/pricing";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Eye,
  LogOut,
  Store,
  Layers,
  Search,
  ExternalLink,
  Save,
  Lock,
} from "lucide-react";

export default function AdminDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // Navigation tab: "dashboard" | "products" | "categories" | "orders" | "settings"
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
    heroBannerSubtitle: "Beli 1 eceran, beli lebih dari 2 langsung dapat harga grosir murah!",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>("");

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states for Product
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState("");
  const [pUnit, setPUnit] = useState("pcs");
  const [pRegularPrice, setPRegularPrice] = useState<number>(0);
  const [pOriginalPrice, setPOriginalPrice] = useState<string>("");
  const [pStock, setPStock] = useState<number>(100);
  const [pDescription, setPDescription] = useState("");
  const [pImageUrl, setPImageUrl] = useState("");
  const [pIsActive, setPIsActive] = useState<boolean>(true);
  const [pIsFeatured, setPIsFeatured] = useState<boolean>(false);
  const [pTierPrices, setPTierPrices] = useState<TierPrice[]>([]);

  // Form states for Category
  const [cName, setCName] = useState("");
  const [cIcon, setCIcon] = useState("📦");
  const [cDescription, setCDescription] = useState("");

  // Check auth session
  useEffect(() => {
    const authSession = sessionStorage.getItem("admin_auth");
    if (authSession === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all admin data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, ordRes, setRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/orders"),
        fetch("/api/settings"),
      ]);

      const [pData, cData, oData, sData] = await Promise.all([
        prodRes.json(),
        catRes.json(),
        ordRes.json(),
        setRes.json(),
      ]);

      if (pData.success) setProducts(pData.data);
      if (cData.success) setCategories(cData.data);
      if (oData.success) setOrders(oData.data);
      if (sData.success) setSettings(sData.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === "123456") {
      sessionStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("PIN Salah. Coba PIN default: 123456");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPinInput("");
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 3000);
  };

  // Open Product Modal (New or Edit)
  const openProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setPName(product.name);
      setPCategory(product.categoryId);
      setPUnit(product.unit || "pcs");
      setPRegularPrice(product.regularPrice);
      setPOriginalPrice(product.originalPrice ? product.originalPrice.toString() : "");
      setPStock(product.stock);
      setPDescription(product.description || "");
      setPImageUrl(product.imageUrl || "");
      setPIsActive(product.isActive);
      setPIsFeatured(product.isFeatured);
      setPTierPrices(product.tierPrices || []);
    } else {
      setEditingProduct(null);
      setPName("");
      setPCategory(categories[0]?.id || "");
      setPUnit("pcs");
      setPRegularPrice(10000);
      setPOriginalPrice("");
      setPStock(50);
      setPDescription("");
      setPImageUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80");
      setPIsActive(true);
      setPIsFeatured(false);
      setPTierPrices([
        { id: "tp-" + Date.now() + "-1", minQty: 2, maxQty: 5, price: 9500, label: "Grosir 2-5" },
        { id: "tp-" + Date.now() + "-2", minQty: 6, maxQty: null, price: 9000, label: "Grosir Dus/Partai" },
      ]);
    }
    setIsProductModalOpen(true);
  };

  // Add / Remove Tier in Product Form
  const handleAddTierRow = () => {
    const lastTier = pTierPrices[pTierPrices.length - 1];
    const nextMin = lastTier ? (lastTier.maxQty ? lastTier.maxQty + 1 : lastTier.minQty + 5) : 2;
    const newTier: TierPrice = {
      id: "tp-" + Date.now(),
      minQty: nextMin,
      maxQty: null,
      price: Math.max(0, pRegularPrice - 1000),
      label: `Grosir ≥ ${nextMin} ${pUnit}`,
    };
    setPTierPrices([...pTierPrices, newTier]);
  };

  const handleUpdateTierRow = (index: number, field: keyof TierPrice, value: any) => {
    const updated = [...pTierPrices];
    updated[index] = { ...updated[index], [field]: value };
    setPTierPrices(updated);
  };

  const handleRemoveTierRow = (index: number) => {
    setPTierPrices(pTierPrices.filter((_, idx) => idx !== index));
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pCategory || pRegularPrice <= 0) {
      alert("Mohon lengkapi Nama, Kategori, dan Harga Produk.");
      return;
    }

    try {
      const payload = {
        name: pName,
        categoryId: pCategory,
        unit: pUnit,
        regularPrice: pRegularPrice,
        originalPrice: pOriginalPrice ? Number(pOriginalPrice) : null,
        stock: pStock,
        description: pDescription,
        imageUrl: pImageUrl,
        isActive: pIsActive,
        isFeatured: pIsFeatured,
        tierPrices: pTierPrices,
      };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("Produk berhasil diperbarui!");
          setIsProductModalOpen(false);
          loadAdminData();
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("Produk baru berhasil ditambahkan!");
          setIsProductModalOpen(false);
          loadAdminData();
        }
      }
    } catch (err) {
      alert("Gagal menyimpan produk.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification("Produk berhasil dihapus!");
        loadAdminData();
      }
    } catch (err) {
      alert("Gagal menghapus produk.");
    }
  };

  // Category Actions
  const openCategoryForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCName(category.name);
      setCIcon(category.icon || "📦");
      setCDescription(category.description || "");
    } else {
      setEditingCategory(null);
      setCName("");
      setCIcon("📦");
      setCDescription("");
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) {
      alert("Nama kategori wajib diisi.");
      return;
    }

    try {
      const payload = { name: cName, icon: cIcon, description: cDescription };
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("Kategori berhasil diperbarui!");
          setIsCategoryModalOpen(false);
          loadAdminData();
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("Kategori baru berhasil ditambahkan!");
          setIsCategoryModalOpen(false);
          loadAdminData();
        }
      }
    } catch (err) {
      alert("Gagal menyimpan kategori.");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus kategori "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification("Kategori berhasil dihapus!");
        loadAdminData();
      }
    } catch (err) {
      alert("Gagal menghapus kategori.");
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (
    orderId: string,
    orderStatus: Order["orderStatus"],
    paymentStatus?: Order["paymentStatus"]
  ) => {
    try {
      const payload: any = { orderStatus };
      if (paymentStatus) payload.paymentStatus = paymentStatus;

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("Status pesanan berhasil diperbarui!");
        loadAdminData();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.data);
        }
      }
    } catch (err) {
      alert("Gagal memperbarui status pesanan.");
    }
  };

  // Quick WhatsApp chat with customer regarding order
  const handleChatCustomerWA = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    let msg = `Halo Kak ${order.customerName},\n`;
    msg += `Kami dari *${settings.storeName}* menginfokan update pesanan Anda:\n\n`;
    msg += `• No. Invoice: *${order.invoiceNumber}*\n`;
    msg += `• Status Pesanan: *${order.orderStatus}*\n`;
    msg += `• Total: *${formatRupiah(order.totalAmount)}*\n\n`;

    if (order.orderStatus === "PROCESSING") {
      msg += `Pesanan Anda sedang kami siapkan & kemas dengan rapi ya kak. Mohon ditunggu! 📦`;
    } else if (order.orderStatus === "SHIPPED") {
      msg += `Pesanan Anda sudah dalam perjalanan diantar oleh kurir kami. Mohon stanby di alamat tujuan ya kak! 🛵`;
    } else if (order.orderStatus === "COMPLETED") {
      msg += `Pesanan telah selesai diterima. Terima kasih banyak sudah berbelanja di toko kami! 🙏`;
    } else {
      msg += `Mohon konfirmasi pesanan Anda ya kak. Terima kasih!`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("Pengaturan toko berhasil disimpan!");
      }
    } catch (err) {
      alert("Gagal menyimpan pengaturan.");
    }
  };

  // Calculations for dashboard
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockProducts = products.filter((p) => p.stock <= 10);

  // If not authenticated, render Login Lockscreen
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          padding: "1rem",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "400px",
            width: "100%",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              color: "var(--primary)",
            }}
          >
            <Lock size={28} />
          </div>

          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            Panel Admin Toko
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Masukkan PIN Keamanan untuk mengelola produk sembako, harga grosir, dan pesanan.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="password"
                placeholder="Masukkan PIN Admin (default: 123456)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="form-input"
                style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "0.2em" }}
                required
                autoFocus
              />
            </div>

            {pinError && (
              <div
                style={{
                  color: "var(--danger)",
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                  fontWeight: 600,
                }}
              >
                {pinError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Buka Panel Admin
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <Link href="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
              ← Kembali ke Toko
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: "1px solid #1e293b",
        }}
      >
        {/* Brand */}
        <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Store size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 800 }}>Admin Sembako</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{settings.storeName}</div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav style={{ padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem", flexGrow: 1 }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius-md)",
              color: activeTab === "dashboard" ? "#ffffff" : "#94a3b8",
              backgroundColor: activeTab === "dashboard" ? "var(--primary)" : "transparent",
              fontWeight: 600,
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius-md)",
              color: activeTab === "products" ? "#ffffff" : "#94a3b8",
              backgroundColor: activeTab === "products" ? "var(--primary)" : "transparent",
              fontWeight: 600,
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <Package size={18} />
            <span>Produk & Harga Grosir</span>
            <span
              style={{
                marginLeft: "auto",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "0.1rem 0.4rem",
                borderRadius: "999px",
                fontSize: "0.7rem",
              }}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius-md)",
              color: activeTab === "categories" ? "#ffffff" : "#94a3b8",
              backgroundColor: activeTab === "categories" ? "var(--primary)" : "transparent",
              fontWeight: 600,
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <FolderTree size={18} />
            <span>Kelola Kategori</span>
            <span
              style={{
                marginLeft: "auto",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "0.1rem 0.4rem",
                borderRadius: "999px",
                fontSize: "0.7rem",
              }}
            >
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius-md)",
              color: activeTab === "orders" ? "#ffffff" : "#94a3b8",
              backgroundColor: activeTab === "orders" ? "var(--primary)" : "transparent",
              fontWeight: 600,
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <ShoppingBag size={18} />
            <span>Daftar Pesanan</span>
            <span
              style={{
                marginLeft: "auto",
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                padding: "0.1rem 0.45rem",
                borderRadius: "999px",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius-md)",
              color: activeTab === "settings" ? "#ffffff" : "#94a3b8",
              backgroundColor: activeTab === "settings" ? "var(--primary)" : "transparent",
              fontWeight: 600,
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <Settings size={18} />
            <span>Pengaturan Toko</span>
          </button>
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link
            href="/"
            target="_blank"
            className="btn btn-secondary btn-sm"
            style={{
              backgroundColor: "#1e293b",
              color: "#ffffff",
              borderColor: "#334155",
              justifyContent: "flex-start",
            }}
          >
            <ExternalLink size={15} />
            <span>Lihat Website Toko</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              color: "#ef4444",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
        {/* Top bar */}
        <header
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid var(--border)",
            padding: "1rem 1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
              {activeTab === "dashboard" && "Dashboard Toko Sembako"}
              {activeTab === "products" && "Katalog Produk & Setting Harga Grosir"}
              {activeTab === "categories" && "Manajemen Kategori Sembako"}
              {activeTab === "orders" && "Kelola Pesanan Pembeli"}
              {activeTab === "settings" && "Pengaturan & Rekening Toko"}
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Kelola stok, harga grosir bertingkat, dan transaksi dengan mudah.
            </p>
          </div>

          {actionMessage && (
            <div
              style={{
                backgroundColor: "#ecfdf5",
                color: "#047857",
                border: "1px solid #a7f3d0",
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <CheckCircle2 size={16} />
              <span>{actionMessage}</span>
            </div>
          )}
        </header>

        {/* Content Body */}
        <div style={{ padding: "1.75rem", overflowY: "auto", flexGrow: 1 }}>
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1.25rem",
                  marginBottom: "2rem",
                }}
              >
                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    TOTAL PENDAPATAN
                  </div>
                  <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--primary)", margin: "0.35rem 0" }}>
                    {formatRupiah(totalRevenue)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Dari pesanan lunas / selesai
                  </div>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    TOTAL PESANAN
                  </div>
                  <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", margin: "0.35rem 0" }}>
                    {orders.length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--accent-hover)", fontWeight: 600 }}>
                    {orders.filter((o) => o.orderStatus === "PENDING").length} butuh diproses
                  </div>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    JUMLAH PRODUK
                  </div>
                  <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", margin: "0.35rem 0" }}>
                    {products.length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Dalam {categories.length} kategori
                  </div>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    STOK MENIPIS (≤ 10)
                  </div>
                  <div style={{ fontSize: "1.65rem", fontWeight: 800, color: lowStockProducts.length > 0 ? "var(--danger)" : "var(--primary)", margin: "0.35rem 0" }}>
                    {lowStockProducts.length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {lowStockProducts.length > 0 ? "Perlu segera restock!" : "Semua stok aman"}
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Pesanan Terbaru</h3>
                  <button onClick={() => setActiveTab("orders")} className="btn btn-sm btn-secondary">
                    Lihat Semua ({orders.length})
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    Belum ada pesanan masuk. Saat pembeli checkout via web atau WhatsApp, data akan tampil di sini.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Pemesan</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td style={{ fontWeight: 700 }}>{order.invoiceNumber}</td>
                            <td>
                              <div>{order.customerName}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.customerPhone}</div>
                            </td>
                            <td style={{ fontWeight: 800, color: "var(--primary)" }}>
                              {formatRupiah(order.totalAmount)}
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    order.orderStatus === "COMPLETED"
                                      ? "#ecfdf5"
                                      : order.orderStatus === "SHIPPED"
                                      ? "#eff6ff"
                                      : order.orderStatus === "PROCESSING"
                                      ? "#fef3c7"
                                      : "#f1f5f9",
                                  color:
                                    order.orderStatus === "COMPLETED"
                                      ? "#047857"
                                      : order.orderStatus === "SHIPPED"
                                      ? "#1d4ed8"
                                      : order.orderStatus === "PROCESSING"
                                      ? "#b45309"
                                      : "#475569",
                                }}
                              >
                                {order.orderStatus}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="btn btn-sm btn-secondary"
                                >
                                  Detail
                                </button>
                                <button
                                  onClick={() => handleChatCustomerWA(order)}
                                  className="btn btn-sm btn-wa"
                                  title="Chat WA Pembeli"
                                >
                                  <MessageCircle size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS & WHOLESALE TIERS */}
          {activeTab === "products" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Daftar Produk Sembako</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Atur harga eceran dan harga grosir bertingkat (Tiered Pricing) untuk setiap produk.
                  </span>
                </div>

                <button onClick={() => openProductForm()} className="btn btn-primary">
                  <Plus size={18} />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>

              {/* Product Table */}
              <div className="card" style={{ padding: "1.25rem" }}>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nama Produk</th>
                        <th>Kategori</th>
                        <th>Harga Eceran (1 pcs)</th>
                        <th>Harga Grosir Bertingkat</th>
                        <th>Stok</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const cat = categories.find((c) => c.id === p.categoryId);
                        return (
                          <tr key={p.id}>
                            <td>
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                style={{ width: "45px", height: "45px", borderRadius: "6px", objectFit: "cover" }}
                              />
                            </td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{p.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Satuan: {p.unit}</div>
                            </td>
                            <td>{cat?.icon} {cat?.name || "-"}</td>
                            <td style={{ fontWeight: 700 }}>{formatRupiah(p.regularPrice)}</td>
                            <td>
                              {p.tierPrices && p.tierPrices.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                  {p.tierPrices.map((t, i) => (
                                    <span key={i} className="badge badge-wholesale" style={{ fontSize: "0.7rem", width: "max-content" }}>
                                      Beli ≥ {t.minQty} {p.unit}: {formatRupiah(t.price)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Hanya Eceran</span>
                              )}
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: p.stock <= 10 ? "var(--danger)" : "inherit" }}>
                                {p.stock} {p.unit}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${p.isActive ? "badge-featured" : "badge-unit"}`}>
                                {p.isActive ? "Aktif" : "Non-aktif"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "0.35rem" }}>
                                <button
                                  onClick={() => openProductForm(p)}
                                  className="btn btn-sm btn-secondary"
                                  title="Edit Produk & Harga Grosir"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="btn btn-sm btn-danger"
                                  title="Hapus Produk"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === "categories" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Kategori Sembako & Minimarket</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Tambah atau ubah kelompok kategori sembako yang tampil di website.
                  </span>
                </div>

                <button onClick={() => openCategoryForm()} className="btn btn-primary">
                  <Plus size={18} />
                  <span>Tambah Kategori</span>
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1rem",
                }}
              >
                {categories.map((cat) => {
                  const productCount = products.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <div key={cat.id} className="card" style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{cat.icon || "📦"}</div>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button
                            onClick={() => openCategoryForm(cat)}
                            className="btn btn-sm btn-secondary"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="btn btn-sm btn-danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                        {cat.name}
                      </h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                        {cat.description || "Kategori sembako pilihan."}
                      </p>

                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)" }}>
                        {productCount} Produk terdaftar
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === "orders" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Daftar Semua Pesanan</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Kelola invoice, update status pesanan, dan kirim info ke WhatsApp pembeli.
                </span>
              </div>

              <div className="card" style={{ padding: "1.25rem" }}>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tanggal & Invoice</th>
                        <th>Data Pembeli</th>
                        <th>Item Pesanan</th>
                        <th>Total & Hemat</th>
                        <th>Metode</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <div style={{ fontWeight: 800 }}>{o.invoiceNumber}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {new Date(o.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{o.customerName}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{o.customerPhone}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {o.customerAddress}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.8rem" }}>
                              {o.items.map((it, idx) => (
                                <div key={idx}>
                                  • {it.productName} ({it.quantity} {it.unit})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, color: "var(--primary)" }}>
                              {formatRupiah(o.totalAmount)}
                            </div>
                            {o.totalSavings > 0 && (
                              <div style={{ fontSize: "0.7rem", color: "#b45309", fontWeight: 700 }}>
                                Hemat: {formatRupiah(o.totalSavings)}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-unit">{o.paymentMethod}</span>
                          </td>
                          <td>
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                              className="form-select"
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">DIPROSES</option>
                              <option value="SHIPPED">DIKIRIM</option>
                              <option value="COMPLETED">SELESAI</option>
                              <option value="CANCELLED">BATAL</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.35rem" }}>
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="btn btn-sm btn-secondary"
                                title="Lihat Struk Lengkap"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleChatCustomerWA(o)}
                                className="btn btn-sm btn-wa"
                                title="Kirim Update ke WhatsApp Pembeli"
                              >
                                <MessageCircle size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: "700px" }}>
              <div className="card" style={{ padding: "1.75rem" }}>
                <form onSubmit={handleSaveSettings}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
                    Pengaturan Toko & Kontak
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Nama Toko Sembako</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slogan Toko</label>
                    <input
                      type="text"
                      value={settings.slogan}
                      onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp Admin (Untuk Menerima Order)</label>
                    <input
                      type="text"
                      placeholder="6281234567890 (Gunakan awalan 62)"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alamat Toko</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "1.75rem 0 1rem" }}>
                    Rekening Pembayaran & QRIS
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label">Nama Bank</label>
                      <input
                        type="text"
                        placeholder="BCA / Mandiri / BRI"
                        value={settings.bankName}
                        onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nomor Rekening</label>
                      <input
                        type="text"
                        value={settings.bankAccount}
                        onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={settings.bankHolder}
                      onChange={(e) => setSettings({ ...settings, bankHolder: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">URL Gambar QRIS Toko</label>
                    <input
                      type="text"
                      value={settings.qrisImageUrl}
                      onChange={(e) => setSettings({ ...settings, qrisImageUrl: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "1.75rem 0 1rem" }}>
                    Biaya Pengiriman (Ongkir)
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label">Ongkir Standar (Rp)</label>
                      <input
                        type="number"
                        value={settings.deliveryFee}
                        onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Minimal Belanja Gratis Ongkir (Rp)</label>
                      <input
                        type="number"
                        value={settings.freeDeliveryMin}
                        onChange={(e) => setSettings({ ...settings, freeDeliveryMin: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "1.75rem 0 1rem" }}>
                    PIN Keamanan Admin
                  </h3>

                  <div className="form-group">
                    <label className="form-label">PIN Masuk Admin</label>
                    <input
                      type="text"
                      value={settings.adminPin}
                      onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                    <Save size={18} />
                    <span>Simpan Pengaturan</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT & WHOLESALE TIER */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "750px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                {editingProduct ? "Edit Produk & Harga Grosir" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                style={{ padding: "4px", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Nama Produk Sembako *</label>
                  <input
                    type="text"
                    placeholder="cth: Minyak Goreng Bimoli 2L Pouch"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="form-select"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Satuan Kemasan *</label>
                  <select
                    value={pUnit}
                    onChange={(e) => setPUnit(e.target.value)}
                    className="form-select"
                  >
                    <option value="pcs">pcs (buah)</option>
                    <option value="kg">kg (kilogram)</option>
                    <option value="liter">liter</option>
                    <option value="pouch">pouch</option>
                    <option value="sak">sak (karung 5/10/25kg)</option>
                    <option value="bks">bungkus (bks)</option>
                    <option value="renceng">renceng</option>
                    <option value="dus">dus (karton)</option>
                    <option value="botol">botol</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Harga Eceran (Beli 1) *</label>
                  <input
                    type="number"
                    value={pRegularPrice}
                    onChange={(e) => setPRegularPrice(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Harga Coret / Promo (Opsional)</label>
                  <input
                    type="number"
                    placeholder="cth: 40000"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Jumlah Stok Fisik *</label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL Foto Produk</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={pImageUrl}
                    onChange={(e) => setPImageUrl(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* TIERED WHOLESALE PRICING BUILDER */}
              <div
                style={{
                  backgroundColor: "#fffbeb",
                  border: "1.5px solid #fde68a",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  margin: "1.25rem 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#92400e" }}>
                      ⚙️ Pengaturan Harga Grosir Bertingkat
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "#b45309" }}>
                      Tentukan harga khusus saat pembeli membeli dalam jumlah banyak (2, 5, 10, dst).
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTierRow}
                    className="btn btn-sm btn-primary"
                  >
                    <Plus size={14} />
                    <span>+ Tambah Rentang Grosir</span>
                  </button>
                </div>

                {pTierPrices.length === 0 ? (
                  <div style={{ fontSize: "0.85rem", color: "#b45309", padding: "0.5rem 0" }}>
                    Belum ada harga grosir untuk produk ini (hanya harga eceran). Klik tombol &quot;+ Tambah Rentang Grosir&quot; untuk mengaktifkannya.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {pTierPrices.map((tier, idx) => (
                      <div
                        key={tier.id || idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1.5fr 1.5fr auto",
                          gap: "0.5rem",
                          alignItems: "center",
                          backgroundColor: "#ffffff",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #fef3c7",
                        }}
                      >
                        <div>
                          <label style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Min Beli</label>
                          <input
                            type="number"
                            min="2"
                            value={tier.minQty}
                            onChange={(e) => handleUpdateTierRow(idx, "minQty", Number(e.target.value))}
                            className="form-input"
                            style={{ padding: "0.3rem 0.5rem", fontSize: "0.85rem" }}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Max Beli</label>
                          <input
                            type="number"
                            placeholder="~"
                            value={tier.maxQty || ""}
                            onChange={(e) =>
                              handleUpdateTierRow(
                                idx,
                                "maxQty",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            className="form-input"
                            style={{ padding: "0.3rem 0.5rem", fontSize: "0.85rem" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Harga Satuan (Rp)</label>
                          <input
                            type="number"
                            value={tier.price}
                            onChange={(e) => handleUpdateTierRow(idx, "price", Number(e.target.value))}
                            className="form-input"
                            style={{ padding: "0.3rem 0.5rem", fontSize: "0.85rem", fontWeight: 700 }}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Label Grosir</label>
                          <input
                            type="text"
                            placeholder="cth: Grosir 2-5 Pouch"
                            value={tier.label || ""}
                            onChange={(e) => handleUpdateTierRow(idx, "label", e.target.value)}
                            className="form-input"
                            style={{ padding: "0.3rem 0.5rem", fontSize: "0.85rem" }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTierRow(idx)}
                          style={{
                            color: "var(--danger)",
                            padding: "0.25rem",
                            cursor: "pointer",
                            marginTop: "1rem",
                          }}
                          title="Hapus baris tier"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status checkboxes */}
              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={pIsActive}
                    onChange={(e) => setPIsActive(e.target.checked)}
                  />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Tampilkan di Website (Aktif)</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={pIsFeatured}
                    onChange={(e) => setPIsFeatured(e.target.checked)}
                  />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Produk Unggulan</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "450px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                style={{ padding: "4px", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ padding: "1.5rem" }}>
              <div className="form-group">
                <label className="form-label">Ikon Emoji (cth: 🌾, 🍳, 🧂, 🥚, 🍜)</label>
                <input
                  type="text"
                  value={cIcon}
                  onChange={(e) => setCIcon(e.target.value)}
                  className="form-input"
                  style={{ width: "80px", textAlign: "center", fontSize: "1.5rem" }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Kategori *</label>
                <input
                  type="text"
                  placeholder="cth: Minyak & Margarin"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="cth: Minyak kelapa sawit kemasan pouch dan jerigen"
                  value={cDescription}
                  onChange={(e) => setCDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAIL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                  Rincian Invoice: {selectedOrder.invoiceNumber}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {new Date(selectedOrder.createdAt).toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: "4px", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div
                style={{
                  backgroundColor: "var(--bg-muted)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1.25rem",
                  fontSize: "0.875rem",
                }}
              >
                <div><strong>Nama:</strong> {selectedOrder.customerName}</div>
                <div><strong>WhatsApp:</strong> {selectedOrder.customerPhone}</div>
                <div><strong>Alamat:</strong> {selectedOrder.customerAddress}</div>
                {selectedOrder.notes && <div><strong>Catatan:</strong> {selectedOrder.notes}</div>}
                <div><strong>Pengiriman:</strong> {selectedOrder.deliveryMethod === "DELIVERY" ? "Diantar ke Rumah" : "Ambil di Toko"}</div>
                <div><strong>Pembayaran:</strong> {selectedOrder.paymentMethod}</div>
              </div>

              <h4 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                Daftar Barang Belanja:
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {selectedOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px dashed var(--border)",
                      paddingBottom: "0.4rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{it.productName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {it.quantity} {it.unit} x {formatRupiah(it.priceApplied)}
                        {it.tierLabel && ` (${it.tierLabel})`}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatRupiah(it.subtotal)}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "2px solid var(--border)", paddingTop: "0.75rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span>Subtotal:</span>
                  <span>{formatRupiah(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span>Ongkir:</span>
                    <span>{formatRupiah(selectedOrder.deliveryFee)}</span>
                  </div>
                )}
                {selectedOrder.totalSavings > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", color: "#b45309", fontWeight: 700 }}>
                    <span>Hemat Grosir:</span>
                    <span>- {formatRupiah(selectedOrder.totalSavings)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 900, color: "var(--primary)", marginTop: "0.5rem" }}>
                  <span>TOTAL:</span>
                  <span>{formatRupiah(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => handleChatCustomerWA(selectedOrder)}
                  className="btn btn-wa"
                  style={{ width: "100%" }}
                >
                  <MessageCircle size={18} />
                  <span>Kirim Pesan WhatsApp ke Pembeli</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
