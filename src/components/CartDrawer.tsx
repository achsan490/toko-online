"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product, StoreSettings } from "@/types";
import { formatRupiah, calculateOrderItem } from "@/lib/pricing";
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Truck,
  Store,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { product: Product; quantity: number }[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  settings: StoreSettings;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  settings,
}: CartDrawerProps) {
  // Step: "cart" | "checkout" | "success"
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [loading, setLoading] = useState<boolean>(false);

  // Form fields
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<"WHATSAPP" | "TRANSFER" | "QRIS" | "COD">("WHATSAPP");
  const [notes, setNotes] = useState<string>("");

  // Last completed order
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  if (!isOpen) return null;

  // Calculate items with dynamic tier pricing
  const calculatedItems = cart.map((item) =>
    calculateOrderItem(item.product, item.quantity)
  );

  const subtotal = calculatedItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalSavings = calculatedItems.reduce((acc, item) => acc + item.savings, 0);
  const isDelivery = deliveryMethod === "DELIVERY";
  const deliveryFee =
    isDelivery && subtotal < (settings.freeDeliveryMin || 150000)
      ? settings.deliveryFee || 10000
      : 0;
  const grandTotal = subtotal + deliveryFee;

  const freeShippingThreshold = settings.freeDeliveryMin || 150000;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCheckoutSubmit = async (directWaOnly: boolean = false) => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Mohon isi Nama dan Nomor WhatsApp Anda.");
      return;
    }

    if (deliveryMethod === "DELIVERY" && !customerAddress.trim()) {
      alert("Mohon masukkan Alamat Pengiriman Anda.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerName,
        customerPhone,
        customerAddress,
        notes,
        deliveryMethod,
        paymentMethod: directWaOnly ? "WHATSAPP" : paymentMethod,
        cartItems: cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setCreatedOrder(data.data);
        setWhatsappUrl(data.whatsappUrl);
        setStep("success");
        onClearCart();

        // If direct WhatsApp chosen, open it immediately
        if (directWaOnly || paymentMethod === "WHATSAPP") {
          window.open(data.whatsappUrl, "_blank");
        }
      } else {
        alert(data.error || "Gagal membuat pesanan");
      }
    } catch (err) {
      console.error("Order submit failed:", err);
      alert("Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "580px",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            backgroundColor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              {step === "cart" && "Keranjang Belanja"}
              {step === "checkout" && "Formulir Pemesanan"}
              {step === "success" && "Pesanan Berhasil!"}
            </h3>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {step === "cart" && `${cart.length} jenis sembako dipilih`}
              {step === "checkout" && "Lengkapi rincian pengiriman & bayar"}
              {step === "success" && "No. Invoice tersimpan di sistem toko"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg-muted)",
              color: "var(--text-muted)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body based on step */}
        <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flexGrow: 1 }}>
          {/* STEP 1: CART LIST */}
          {step === "cart" && (
            <>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🧺</div>
                  <h4 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                    Keranjang Masih Kosong
                  </h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    Yuk pilih kebutuhan pokok dan sembako berkualitas dengan harga grosir!
                  </p>
                  <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{ marginTop: "1.25rem" }}
                  >
                    Mulai Belanja Sekarang
                  </button>
                </div>
              ) : (
                <div>
                  {/* Free shipping progress bar */}
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem",
                      marginBottom: "1rem",
                      fontSize: "0.8rem",
                      color: "#166534",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span>
                        {freeShippingRemaining > 0 ? (
                          <>
                            Beli <strong>{formatRupiah(freeShippingRemaining)}</strong> lagi untuk <strong>GRATIS ONGKIR</strong>!
                          </>
                        ) : (
                          <>🎉 <strong>Selamat! Anda mendapatkan Gratis Ongkir!</strong></>
                        )}
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        {formatRupiah(subtotal)} / {formatRupiah(freeShippingThreshold)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        backgroundColor: "#dcfce7",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${freeShippingProgress}%`,
                          backgroundColor: "#16a34a",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Wholesale Savings Notification */}
                  {totalSavings > 0 && (
                    <div
                      style={{
                        backgroundColor: "#fef3c7",
                        border: "1px solid #fde68a",
                        borderRadius: "var(--radius-md)",
                        padding: "0.625rem 0.875rem",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#92400e",
                        fontSize: "0.825rem",
                        fontWeight: 700,
                      }}
                    >
                      <Sparkles size={18} color="#d97706" />
                      <span>
                        Total hemat harga grosir: <strong>{formatRupiah(totalSavings)}</strong>!
                      </span>
                    </div>
                  )}

                  {/* Item List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    {calculatedItems.map((item) => (
                      <div
                        key={item.productId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.875rem",
                          padding: "0.875rem",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--bg-muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "var(--radius-sm)",
                              objectFit: "cover",
                              backgroundColor: "#ffffff",
                            }}
                          />
                        )}

                        <div style={{ flexGrow: 1 }}>
                          <h4
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              lineHeight: 1.25,
                              marginBottom: "0.25rem",
                            }}
                          >
                            {item.productName}
                          </h4>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.825rem", fontWeight: 800, color: "var(--primary)" }}>
                              {formatRupiah(item.priceApplied)}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              /{item.unit}
                            </span>
                            {item.tierLabel && (
                              <span className="badge badge-wholesale" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                                {item.tierLabel}
                              </span>
                            )}
                          </div>

                          {item.savings > 0 && (
                            <div style={{ fontSize: "0.7rem", color: "#047857", fontWeight: 700, marginTop: "2px" }}>
                              Hemat {formatRupiah(item.savings)}
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              backgroundColor: "#ffffff",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.productId, -1)}
                              style={{ padding: "0.25rem 0.5rem", color: "var(--text-main)" }}
                            >
                              <Minus size={14} />
                            </button>
                            <span
                              style={{
                                width: "26px",
                                textAlign: "center",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.productId, 1)}
                              style={{ padding: "0.25rem 0.5rem", color: "var(--text-main)" }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.875rem", fontWeight: 800 }}>
                              {formatRupiah(item.subtotal)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.productId)}
                              style={{ color: "var(--danger)", padding: "2px" }}
                              title="Hapus item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {step === "checkout" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap Pemesan *</label>
                <input
                  type="text"
                  placeholder="cth: Ibu Siti Aminah / Pak Budi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor WhatsApp Aktif *</label>
                <input
                  type="tel"
                  placeholder="cth: 081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Delivery Method Selector */}
              <div className="form-group">
                <label className="form-label">Metode Pengiriman</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("DELIVERY")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid",
                      borderColor: deliveryMethod === "DELIVERY" ? "var(--primary)" : "var(--border)",
                      backgroundColor: deliveryMethod === "DELIVERY" ? "var(--primary-light)" : "#ffffff",
                      color: deliveryMethod === "DELIVERY" ? "var(--primary-dark)" : "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    <Truck size={18} />
                    <span>Diantar ke Rumah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("PICKUP")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid",
                      borderColor: deliveryMethod === "PICKUP" ? "var(--primary)" : "var(--border)",
                      backgroundColor: deliveryMethod === "PICKUP" ? "var(--primary-light)" : "#ffffff",
                      color: deliveryMethod === "PICKUP" ? "var(--primary-dark)" : "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    <Store size={18} />
                    <span>Ambil di Toko</span>
                  </button>
                </div>
              </div>

              {deliveryMethod === "DELIVERY" && (
                <div className="form-group">
                  <label className="form-label">Alamat Lengkap Pengiriman *</label>
                  <textarea
                    rows={3}
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan lokasi (cth: Dekat Masjid / Cat Pagar Biru)..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="form-group">
                <label className="form-label">Metode Pembayaran</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("WHATSAPP")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid",
                      borderColor: paymentMethod === "WHATSAPP" ? "var(--wa-green)" : "var(--border)",
                      backgroundColor: paymentMethod === "WHATSAPP" ? "var(--wa-light)" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.825rem",
                      cursor: "pointer",
                    }}
                  >
                    <MessageCircle size={18} color="var(--wa-green)" />
                    <span>Konfirmasi WA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("TRANSFER")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid",
                      borderColor: paymentMethod === "TRANSFER" ? "var(--primary)" : "var(--border)",
                      backgroundColor: paymentMethod === "TRANSFER" ? "var(--primary-light)" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.825rem",
                      cursor: "pointer",
                    }}
                  >
                    <CreditCard size={18} color="var(--primary)" />
                    <span>Transfer Bank ({settings.bankName || "BCA"})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid",
                      borderColor: paymentMethod === "QRIS" ? "var(--primary)" : "var(--border)",
                      backgroundColor: paymentMethod === "QRIS" ? "var(--primary-light)" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.825rem",
                      cursor: "pointer",
                    }}
                  >
                    <QrCode size={18} color="var(--primary)" />
                    <span>Scan QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid",
                      borderColor: paymentMethod === "COD" ? "var(--primary)" : "var(--border)",
                      backgroundColor: paymentMethod === "COD" ? "var(--primary-light)" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.825rem",
                      cursor: "pointer",
                    }}
                  >
                    <Banknote size={18} color="var(--primary)" />
                    <span>COD / Bayar di Tempat</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="cth: Tolong bungkus terpisah, kirim sebelum jam 12 siang..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === "success" && createdOrder && (
            <div style={{ textAlign: "center", padding: "1.5rem 0.5rem" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#ecfdf5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "var(--primary)",
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                Pesanan Berhasil Dicatat!
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Nomor Pesanan: <strong>{createdOrder.invoiceNumber}</strong>
              </p>

              {/* Order summary box */}
              <div
                style={{
                  backgroundColor: "var(--bg-muted)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Pemesan:</span>
                  <strong>{createdOrder.customerName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Total Belanja:</span>
                  <strong style={{ color: "var(--primary)", fontSize: "1rem" }}>
                    {formatRupiah(createdOrder.totalAmount)}
                  </strong>
                </div>
                {createdOrder.totalSavings > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Hemat Grosir:</span>
                    <strong style={{ color: "#b45309" }}>
                      {formatRupiah(createdOrder.totalSavings)}
                    </strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Metode Kirim:</span>
                  <span>{createdOrder.deliveryMethod === "DELIVERY" ? "Diantar ke Rumah" : "Ambil di Toko"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Pembayaran:</span>
                  <span style={{ fontWeight: 600 }}>{createdOrder.paymentMethod}</span>
                </div>

                {/* If bank transfer, show account info */}
                {createdOrder.paymentMethod === "TRANSFER" && (
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "0.75rem",
                      borderTop: "1px dashed var(--border)",
                      backgroundColor: "#ffffff",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                      Rekening Pembayaran:
                    </div>
                    <div>Bank: {settings.bankName || "BCA"}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)" }}>
                      {settings.bankAccount || "8830123456"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      a/n {settings.bankHolder || "Toko Sembako Berkah"}
                    </div>
                  </div>
                )}

                {/* If QRIS */}
                {createdOrder.paymentMethod === "QRIS" && (
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "0.75rem",
                      borderTop: "1px dashed var(--border)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
                      Scan QRIS Toko untuk Pembayaran:
                    </div>
                    <img
                      src={settings.qrisImageUrl || "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PROMO-QRIS-SEMBAKO"}
                      alt="QRIS Toko"
                      style={{ width: "180px", height: "180px", margin: "0 auto", borderRadius: "8px" }}
                    />
                  </div>
                )}
              </div>

              {/* Action button to open WhatsApp & Track Order */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa btn-lg"
                  style={{ width: "100%" }}
                >
                  <MessageCircle size={22} />
                  <span>Kirim Struk ke WhatsApp Admin</span>
                </a>

                <Link
                  href={`/lacak-pesanan?inv=${createdOrder.invoiceNumber}`}
                  className="btn btn-secondary"
                  style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  onClick={onClose}
                >
                  <Truck size={18} color="var(--primary)" />
                  <span>Lacak Status Pesanan Ini</span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "0.5rem" }}
                >
                  Tutup & Belanja Lagi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions for Step 1 & 2 */}
        {step !== "success" && cart.length > 0 && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderTop: "1px solid var(--border)",
              backgroundColor: "#ffffff",
              boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Summary lines */}
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.35rem",
                }}
              >
                <span>Subtotal ({calculatedItems.reduce((a, b) => a + b.quantity, 0)} item):</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              {step === "checkout" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.35rem",
                  }}
                >
                  <span>Ongkos Kirim:</span>
                  <span>
                    {deliveryMethod === "PICKUP"
                      ? "Gratis (Ambil di Toko)"
                      : deliveryFee === 0
                      ? "Gratis Ongkir"
                      : formatRupiah(deliveryFee)}
                  </span>
                </div>
              )}

              {totalSavings > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.875rem",
                    color: "#b45309",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                  }}
                >
                  <span>Hemat Harga Grosir:</span>
                  <span>- {formatRupiah(totalSavings)}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.15rem",
                  fontWeight: 900,
                  color: "var(--text-main)",
                  paddingTop: "0.35rem",
                  borderTop: "1px dashed var(--border)",
                }}
              >
                <span>Total:</span>
                <span style={{ color: "var(--primary)" }}>{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Buttons */}
            {step === "cart" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <button
                  type="button"
                  className="btn btn-wa"
                  onClick={() => setStep("checkout")}
                  style={{ width: "100%" }}
                >
                  <MessageCircle size={18} />
                  <span>Pesan via WA</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep("checkout")}
                  style={{ width: "100%" }}
                >
                  <span>Lanjut Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-wa btn-lg"
                  disabled={loading}
                  onClick={() => handleCheckoutSubmit(true)}
                  style={{ width: "100%" }}
                >
                  <MessageCircle size={20} />
                  <span>{loading ? "Memproses..." : "Kirim Pesanan via WhatsApp"}</span>
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setStep("cart")}
                    disabled={loading}
                  >
                    Kembali ke Keranjang
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={() => handleCheckoutSubmit(false)}
                  >
                    Konfirmasi Pesanan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
