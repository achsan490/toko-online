"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Order, StoreSettings } from "@/types";
import { formatRupiah } from "@/lib/pricing";
import {
  Search,
  Store,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ArrowLeft,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialInv = searchParams.get("inv") || "";

  const [queryInput, setQueryInput] = useState<string>(initialInv);
  const [loading, setLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Load store settings
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  // Auto search if query param provided
  useEffect(() => {
    if (initialInv) {
      handleSearch(initialInv);
    }
  }, [initialInv]);

  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) {
      setErrorMessage("Silakan masukkan Nomor Invoice atau Nomor WhatsApp.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setErrorMessage(data.error || "Pesanan tidak ditemukan. Periksa kembali nomor yang Anda masukkan.");
      }
    } catch (err) {
      setErrorMessage("Terjadi gangguan koneksi saat mencari pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (currentStatus: Order["orderStatus"]) => {
    // Returns index 1 to 4
    switch (currentStatus) {
      case "PENDING":
        return 1;
      case "PROCESSING":
        return 2;
      case "SHIPPED":
        return 3;
      case "COMPLETED":
        return 4;
      case "CANCELLED":
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = order ? getStepStatus(order.orderStatus) : 0;

  const handleChatWA = () => {
    if (!order || !settings) return;
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, "");
    const msg = `Halo ${settings.storeName}, saya ingin menanyakan status pesanan saya dengan No. Invoice: *${order.invoiceNumber}* atas nama *${order.customerName}*. Terima kasih!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            color: "var(--primary)",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog Toko</span>
        </Link>
      </div>

      {/* Title Card */}
      <div
        className="card"
        style={{
          padding: "1.75rem",
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 0.75rem",
          }}
        >
          <Truck size={26} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.35rem" }}>
          Lacak Pesanan Sembako Anda
        </h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "520px", margin: "0 auto" }}>
          Pantau status pengemasan dan pengantaran pesanan sembako Anda secara real-time.
        </p>

        {/* Search Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(queryInput);
          }}
          style={{
            display: "flex",
            gap: "0.5rem",
            maxWidth: "520px",
            margin: "1.5rem auto 0",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Masukkan No. Invoice (INV-...) atau No. HP..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="form-input"
            style={{
              flex: "1 1 240px",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.9rem",
              border: "none",
              color: "#0f172a",
            }}
          />
          <button
            type="submit"
            className="btn btn-accent"
            disabled={loading}
            style={{
              borderRadius: "var(--radius-full)",
              padding: "0.75rem 1.5rem",
              fontWeight: 700,
            }}
          >
            {loading ? "Mencari..." : "Lacak"}
          </button>
        </form>
      </div>

      {/* Error Message if not found */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tracking Results Card */}
      {order && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
          {/* Header Info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Nomor Invoice
              </span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)" }}>
                {order.invoiceNumber}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                <Calendar size={14} />
                <span>
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                Status Saat Ini:
              </span>
              <span
                className="badge"
                style={{
                  fontSize: "0.85rem",
                  padding: "0.35rem 0.75rem",
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
                {order.orderStatus === "PENDING" && "Menunggu Konfirmasi"}
                {order.orderStatus === "PROCESSING" && "Sedang Dikemas"}
                {order.orderStatus === "SHIPPED" && (order.deliveryMethod === "DELIVERY" ? "Dalam Pengantaran" : "Siap Diambil")}
                {order.orderStatus === "COMPLETED" && "Pesanan Selesai"}
                {order.orderStatus === "CANCELLED" && "Pesanan Dibatalkan"}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {order.orderStatus !== "CANCELLED" ? (
            <div style={{ margin: "2rem 0" }}>
              <div className="tracking-stepper">
                {/* Step 1 */}
                <div className={`stepper-step ${currentStep >= 1 ? (currentStep === 1 ? "active" : "completed") : ""}`}>
                  <div className="stepper-icon">
                    <Clock size={20} />
                  </div>
                  <div className="stepper-label">Pesanan Diterima</div>
                </div>

                {/* Step 2 */}
                <div className={`stepper-step ${currentStep >= 2 ? (currentStep === 2 ? "active" : "completed") : ""}`}>
                  <div className="stepper-icon">
                    <Package size={20} />
                  </div>
                  <div className="stepper-label">Sedang Dikemas</div>
                </div>

                {/* Step 3 */}
                <div className={`stepper-step ${currentStep >= 3 ? (currentStep === 3 ? "active" : "completed") : ""}`}>
                  <div className="stepper-icon">
                    <Truck size={20} />
                  </div>
                  <div className="stepper-label">
                    {order.deliveryMethod === "DELIVERY" ? "Dalam Pengantaran" : "Siap Diambil"}
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`stepper-step ${currentStep >= 4 ? "completed active" : ""}`}>
                  <div className="stepper-icon">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="stepper-label">Pesanan Selesai</div>
                </div>
              </div>

              {/* Status explanation box */}
              <div
                style={{
                  backgroundColor: "var(--bg-muted)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  marginTop: "1.5rem",
                  borderLeft: "4px solid var(--primary)",
                }}
              >
                {currentStep === 1 && (
                  <div>
                    📝 <strong>Pesanan Anda sudah masuk ke sistem toko.</strong> Admin sedang memeriksa ketersediaan stok barang dan menyiapkan nota.
                  </div>
                )}
                {currentStep === 2 && (
                  <div>
                    📦 <strong>Barang sedang ditimbang dan dikemas rapi.</strong> Semua pesanan diperiksa kebersihannya sebelum dikirim ke alamat Anda.
                  </div>
                )}
                {currentStep === 3 && (
                  <div>
                    🛵 <strong>Pesanan sedang dalam perjalanan diantar kurir.</strong> Mohon pastikan nomor telepon Anda aktif dan standby di lokasi.
                  </div>
                )}
                {currentStep === 4 && (
                  <div>
                    🎉 <strong>Pesanan telah berhasil diserahkan dan selesai.</strong> Terima kasih banyak telah berbelanja di Berkah Mart!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#fef2f2",
                color: "#991b1b",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "1.5rem 0",
              }}
            >
              <XCircle size={20} />
              <span>Pesanan ini telah dibatalkan. Silakan hubungi admin via WhatsApp untuk informasi lebih lanjut.</span>
            </div>
          )}

          {/* Delivery & Customer Details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              backgroundColor: "#f8fafc",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              margin: "1.5rem 0",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
                Penerima
              </div>
              <div style={{ fontWeight: 700, marginTop: "2px" }}>{order.customerName}</div>
              <div style={{ color: "var(--text-muted)" }}>{order.customerPhone}</div>
            </div>

            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
                Alamat Pengiriman
              </div>
              <div style={{ marginTop: "2px" }}>
                {order.deliveryMethod === "DELIVERY" ? order.customerAddress : "Ambil Sendiri di Toko"}
              </div>
              {order.notes && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Catatan: {order.notes}
                </div>
              )}
            </div>

            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
                Metode Pembayaran
              </div>
              <div style={{ fontWeight: 700, marginTop: "2px" }}>{order.paymentMethod}</div>
              <div style={{ color: "var(--text-muted)" }}>Status: {order.paymentStatus}</div>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Rincian Barang Belanja:
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0",
                    borderBottom: "1px dashed var(--border)",
                    fontSize: "0.85rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.productName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {it.quantity} {it.unit} x {formatRupiah(it.priceApplied)}
                      {it.tierLabel && (
                        <span className="badge badge-wholesale" style={{ marginLeft: "0.35rem", fontSize: "0.65rem", padding: "0.1rem 0.35rem" }}>
                          {it.tierLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{formatRupiah(it.subtotal)}</div>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "2px solid var(--border)", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal:</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Ongkos Kirim:</span>
                  <span>{formatRupiah(order.deliveryFee)}</span>
                </div>
              )}
              {order.totalSavings > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", color: "#b45309", fontWeight: 700 }}>
                  <span>Hemat Harga Grosir:</span>
                  <span>- {formatRupiah(order.totalSavings)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", fontWeight: 900, color: "var(--primary)", marginTop: "0.5rem" }}>
                <span>TOTAL AKHIR:</span>
                <span>{formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Action: WhatsApp Contact */}
          <div style={{ marginTop: "1.75rem" }}>
            <button
              onClick={handleChatWA}
              className="btn btn-wa btn-lg"
              style={{ width: "100%" }}
            >
              <MessageCircle size={20} />
              <span>Tanya Status Pengantaran via WhatsApp Toko</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LacakPesananPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-body)", display: "flex", flexDirection: "column" }}>
      {/* Mini Header */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid var(--border)",
          padding: "1rem",
        }}
      >
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Store size={20} />
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
              Berkah Mart Sembako
            </span>
          </Link>

          <Link href="/" className="btn btn-secondary btn-sm">
            Katalog Produk
          </Link>
        </div>
      </header>

      <main style={{ flexGrow: 1 }}>
        <Suspense fallback={<div style={{ textAlign: "center", padding: "3rem" }}>Memuat status pesanan...</div>}>
          <TrackingContent />
        </Suspense>
      </main>
    </div>
  );
}
