"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { formatRupiah, getProductUnitPrice, getNextWholesaleTier } from "@/lib/pricing";
import { X, ShoppingCart, MessageCircle, Layers, CheckCircle2, TrendingDown } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onDirectWhatsApp: (product: Product, quantity: number) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onDirectWhatsApp,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setQuantity(product.minOrder || 1);
      setIsAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const { unitPrice, appliedTier, isWholesale, savingsPerUnit } =
    getProductUnitPrice(product, quantity);
  const nextTierInfo = getNextWholesaleTier(product, quantity);
  const subtotal = unitPrice * quantity;
  const totalSavings = savingsPerUnit * quantity;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-wholesale">Detail Produk & Grosir</span>
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

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Image */}
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                backgroundColor: "#f1f5f9",
                height: "260px",
                position: "relative",
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "0.75rem",
                  left: "0.75rem",
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  color: "#ffffff",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backdropFilter: "blur(4px)",
                }}
              >
                Stok Tersedia: {product.stock} {product.unit}
              </div>
            </div>

            {/* Title & Pricing Summary */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Satuan: {product.unit}
                </span>
                <h2
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    margin: "0.35rem 0 0.75rem",
                    color: "var(--text-main)",
                  }}
                >
                  {product.name}
                </h2>

                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                    marginBottom: "1rem",
                  }}
                >
                  {product.description || "Produk sembako berkualitas, selalu fresh dan siap kirim ke rumah Anda."}
                </p>
              </div>

              {/* Dynamic Price Box */}
              <div
                style={{
                  backgroundColor: isWholesale ? "var(--accent-light)" : "var(--primary-light)",
                  border: `1.5px solid ${isWholesale ? "var(--accent-border)" : "var(--primary-border)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: isWholesale ? "#b45309" : "var(--primary-dark)" }}>
                    {isWholesale ? "🎉 HARGA GROSIR AKTIF" : "HARGA ECERAN"}
                  </span>
                  {appliedTier && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#b45309" }}>
                      {appliedTier.label}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <span
                    style={{
                      fontSize: "1.65rem",
                      fontWeight: 900,
                      color: isWholesale ? "#b45309" : "var(--primary-dark)",
                    }}
                  >
                    {formatRupiah(unitPrice)}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    /{product.unit}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#b45309",
                      marginTop: "0.25rem",
                    }}
                  >
                    <TrendingDown size={16} />
                    <span>Hemat Total: {formatRupiah(totalSavings)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wholesale Tier Breakdown Table */}
          {product.tierPrices && product.tierPrices.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.625rem",
                }}
              >
                <Layers size={18} color="var(--primary)" />
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  Daftar Pilihan Harga Grosir
                </h4>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Jumlah Pembelian</th>
                      <th>Harga per {product.unit}</th>
                      <th>Hemat / {product.unit}</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Regular / Eceran Row */}
                    <tr
                      style={{
                        backgroundColor: !isWholesale ? "rgba(5, 150, 105, 0.08)" : undefined,
                      }}
                    >
                      <td>1 {product.unit} (Eceran)</td>
                      <td style={{ fontWeight: 700 }}>{formatRupiah(product.regularPrice)}</td>
                      <td style={{ color: "var(--text-muted)" }}>-</td>
                      <td>
                        {!isWholesale ? (
                          <span className="badge badge-featured">
                            <CheckCircle2 size={12} /> Aktif
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>-</span>
                        )}
                      </td>
                    </tr>

                    {/* Tier Rows */}
                    {product.tierPrices.map((tier) => {
                      const isCurrentActive = appliedTier?.id === tier.id;
                      const savings = Math.max(0, product.regularPrice - tier.price);
                      const rangeText =
                        tier.maxQty !== null
                          ? `${tier.minQty} - ${tier.maxQty} ${product.unit}`
                          : `≥ ${tier.minQty} ${product.unit} (${tier.label || "Partai/Dus"})`;

                      return (
                        <tr
                          key={tier.id}
                          style={{
                            backgroundColor: isCurrentActive ? "rgba(245, 158, 11, 0.12)" : undefined,
                          }}
                        >
                          <td style={{ fontWeight: 600 }}>{rangeText}</td>
                          <td style={{ fontWeight: 800, color: "#b45309" }}>
                            {formatRupiah(tier.price)}
                          </td>
                          <td style={{ color: "#047857", fontWeight: 600 }}>
                            Hemat {formatRupiah(savings)}
                          </td>
                          <td>
                            {isCurrentActive ? (
                              <span className="badge badge-wholesale">
                                <CheckCircle2 size={12} /> Aktif Sekarang!
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {quantity < tier.minQty ? `Beli ${tier.minQty - quantity} lagi` : "-"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Teaser to buy more */}
              {nextTierInfo && (
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "var(--radius-md)",
                    padding: "0.625rem 0.875rem",
                    marginTop: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    color: "#166534",
                  }}
                >
                  <div>
                    💡 Tambah <strong>{nextTierInfo.itemsNeeded} {product.unit} lagi</strong> untuk dapat harga lebih murah{" "}
                    <strong>{formatRupiah(nextTierInfo.potentialPrice)}</strong>!
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + nextTierInfo.itemsNeeded)}
                    className="btn btn-sm btn-primary"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    + Tambah ({nextTierInfo.itemsNeeded})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quantity & Action Controls */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            {/* Quantity Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Jumlah:</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "var(--bg-muted)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: "50px",
                    textAlign: "center",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(product.stock || 999, prev + 1))}
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "var(--bg-muted)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Calculation */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Harga ({quantity} {product.unit}):</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text-main)" }}>
                {formatRupiah(subtotal)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginTop: "1.25rem",
            }}
          >
            <button
              type="button"
              className={`btn ${isAdded ? "btn-secondary" : "btn-primary"} btn-lg`}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {isAdded ? (
                <>
                  <CheckCircle2 size={20} color="var(--primary)" />
                  <span>Berhasil Ditambahkan!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>+ Tambah ke Keranjang</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-wa btn-lg"
              onClick={() => onDirectWhatsApp(product, quantity)}
            >
              <MessageCircle size={20} />
              <span>Pesan via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
