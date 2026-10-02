"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { formatRupiah, getProductUnitPrice } from "@/lib/pricing";
import { Plus, ShoppingCart, MessageCircle, Layers, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onDirectWhatsApp: (product: Product, quantity: number) => void;
  onViewDetail: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onDirectWhatsApp,
  onViewDetail,
}: ProductCardProps) {
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Calculate current price based on selectedQty
  const { unitPrice, appliedTier, isWholesale, savingsPerUnit } =
    getProductUnitPrice(product, selectedQty);

  const hasTierPrices = product.tierPrices && product.tierPrices.length > 0;
  // Lowest possible wholesale price
  const lowestWholesalePrice = hasTierPrices
    ? Math.min(...product.tierPrices.map((t) => t.price))
    : product.regularPrice;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedQty);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleQuickWa = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDirectWhatsApp(product, selectedQty);
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        height: "100%",
      }}
      onClick={() => onViewDetail(product)}
    >
      {/* Product Image Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "72%", // aspect ratio
          backgroundColor: "#f1f5f9",
          overflow: "hidden",
        }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
          loading="lazy"
          onError={(e) => {
            // fallback if image fails to load
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";
          }}
        />

        {/* Badges on top of image */}
        <div
          style={{
            position: "absolute",
            top: "0.625rem",
            left: "0.625rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            zIndex: 2,
          }}
        >
          {hasTierPrices && (
            <span className="badge badge-wholesale">
              <Layers size={12} />
              Grosir Tersedia
            </span>
          )}

          {product.originalPrice && product.originalPrice > product.regularPrice && (
            <span className="badge badge-discount">
              Diskon{" "}
              {Math.round(
                ((product.originalPrice - product.regularPrice) /
                  product.originalPrice) *
                  100
              )}
              %
            </span>
          )}
        </div>

        {/* Stock pill */}
        <div
          style={{
            position: "absolute",
            bottom: "0.5rem",
            right: "0.5rem",
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            color: "#ffffff",
            padding: "0.2rem 0.5rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.7rem",
            fontWeight: 600,
            backdropFilter: "blur(4px)",
          }}
        >
          {product.stock > 0 ? `Stok: ${product.stock}` : "Stok Habis"}
        </div>
      </div>

      {/* Card Content */}
      <div className="product-card-body">
        <div>
          {/* Unit badge */}
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              marginBottom: "0.2rem",
              textTransform: "uppercase",
              letterSpacing: "0.025em",
              fontWeight: 600,
            }}
          >
            Satuan: {product.unit}
          </div>

          {/* Product Name */}
          <h3 className="product-card-title" title={product.name}>
            {product.name}
          </h3>

          {/* Price Section */}
          <div style={{ marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: isWholesale ? "var(--accent)" : "var(--primary)",
                }}
              >
                {formatRupiah(unitPrice)}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                /{product.unit}
              </span>
            </div>

            {product.originalPrice && product.originalPrice > product.regularPrice && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-light)",
                  textDecoration: "line-through",
                  marginTop: "-0.15rem",
                }}
              >
                {formatRupiah(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Wholesale Pricing Teaser Box */}
          {hasTierPrices && (
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px dashed #fcd34d",
                borderRadius: "var(--radius-sm)",
                padding: "0.35rem 0.5rem",
                fontSize: "0.7rem",
                color: "#92400e",
                marginBottom: "0.625rem",
              }}
            >
              <div style={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Grosir:</span>
                <span style={{ color: "#b45309", fontWeight: 800 }}>
                  mulai {formatRupiah(lowestWholesalePrice)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quantity and Actions Bar */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.5rem" }}>
          {/* Quick Quantity Selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)" }}>
              Jumlah:
            </span>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "var(--bg-muted)",
                borderRadius: "var(--radius-sm)",
                padding: "1px",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedQty((prev) => Math.max(1, prev - 1))}
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  backgroundColor: "#ffffff",
                  boxShadow: "var(--shadow-xs)",
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock || 999}
                value={selectedQty}
                onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: "28px",
                  textAlign: "center",
                  border: "none",
                  backgroundColor: "transparent",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: "var(--text-main)",
                }}
              />
              <button
                type="button"
                onClick={() => setSelectedQty((prev) => Math.min(product.stock || 999, prev + 1))}
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  backgroundColor: "#ffffff",
                  boxShadow: "var(--shadow-xs)",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Wholesale applied feedback badge if active for selectedQty */}
          {isWholesale && (
            <div
              style={{
                fontSize: "0.7rem",
                color: "#b45309",
                backgroundColor: "#fef3c7",
                padding: "0.25rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "0.625rem",
              }}
            >
              🎉 Grosir Aktif: Hemat {formatRupiah(savingsPerUnit * selectedQty)}!
            </div>
          )}

          {/* Buttons: Add to Cart & Quick WA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.5rem" }}>
            <button
              type="button"
              className={`btn ${isAdded ? "btn-secondary" : "btn-primary"} btn-sm`}
              onClick={handleAdd}
              disabled={product.stock <= 0}
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "0.8rem",
              }}
            >
              {isAdded ? (
                <>
                  <Check size={16} color="var(--primary)" />
                  <span>Masuk</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  <span>+ Keranjang</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-wa btn-sm"
              onClick={handleQuickWa}
              title="Pesan Cepat via WhatsApp"
              style={{
                padding: "0.5rem 0.65rem",
              }}
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
