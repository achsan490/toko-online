"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Search, Store, Truck } from "lucide-react";
import { formatRupiah } from "@/lib/pricing";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  storeName?: string;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  cartCount,
  cartTotal,
  onOpenCart,
  storeName = "Berkah Mart Sembako",
}: NavbarProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div className="container" style={{ padding: "0.75rem 1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {/* Logo & Brand */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 10px rgba(5, 150, 105, 0.3)",
              }}
            >
              <Store size={24} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "-0.01em",
                }}
              >
                {storeName}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--primary)",
                  fontWeight: 600,
                }}
              >
                Grosir & Eceran Murah
              </div>
            </div>
          </Link>

          {/* Search bar */}
          <div
            style={{
              flex: "1 1 280px",
              maxWidth: "450px",
              position: "relative",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Cari minyak, beras, gula, mie instan..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "2.5rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-muted)",
                borderColor: "transparent",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {/* Action buttons: Lacak Pesanan & Cart */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Lacak Pesanan Button */}
            <Link
              href="/lacak-pesanan"
              className="btn btn-secondary btn-sm"
              title="Lacak status pesanan Anda"
              style={{
                borderRadius: "var(--radius-full)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.8rem",
                padding: "0.5rem 0.75rem",
              }}
            >
              <Truck size={16} color="var(--primary)" />
              <span>Lacak</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="btn btn-primary"
              style={{
                borderRadius: "var(--radius-full)",
                padding: "0.5rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div style={{ position: "relative" }}>
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-10px",
                      backgroundColor: "var(--accent)",
                      color: "#ffffff",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      borderRadius: "999px",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  lineHeight: 1.1,
                }}
              >
                <span style={{ fontSize: "0.7rem", opacity: 0.9 }}>Keranjang</span>
                <span style={{ fontSize: "0.825rem", fontWeight: 700 }}>
                  {formatRupiah(cartTotal)}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
