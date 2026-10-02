"use client";

import React from "react";
import { StoreSettings } from "@/types";
import { Store, Phone, MapPin, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  const cleanPhone = settings.whatsappNumber?.replace(/[^0-9]/g, "") || "6281234567890";

  return (
    <footer
      style={{
        marginTop: "auto",
        backgroundColor: "#0f172a",
        color: "#94a3b8",
        padding: "3.5rem 0 2rem",
        borderTop: "1px solid #1e293b",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Col 1: Store info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ffffff", marginBottom: "0.75rem" }}>
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
              <span style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                {settings.storeName}
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#94a3b8", marginBottom: "1rem" }}>
              {settings.slogan || "Pusat belanja kebutuhan pokok dan sembako murah eceran dan grosir. Belanja makin banyak, makin hemat!"}
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#34d399", fontSize: "0.8rem", fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Garansi Barang Asli & Timbangan Pas</span>
            </div>
          </div>

          {/* Col 2: Contact & WhatsApp */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
              Layanan Pelanggan
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{settings.address || "Jl. Pasar Lama No. 45"}, {settings.city || "Jakarta"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>Buka Setiap Hari: 07.00 - 21.00 WIB</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={18} color="#25D366" style={{ flexShrink: 0 }} />
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#25D366", fontWeight: 700 }}
                >
                  +{cleanPhone} (WhatsApp Toko)
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Wholesale Policy */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
              Grosir & Kemitraan
            </h4>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
              Menerima pesanan partai besar untuk warung kelontong, katering, restoran, dan pembagian bansos/sembako kantor.
            </p>
            <a
              href={`https://wa.me/${cleanPhone}?text=Halo%20Admin,%20saya%20tertarik%20untuk%20pesan%20sembako%20partai%20besar`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa btn-sm"
              style={{ display: "inline-flex" }}
            >
              Hubungi Sales Grosir
            </a>
          </div>

          {/* Col 4: Quick Links */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
              Menu Pintar
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
              <Link href="/" style={{ color: "#cbd5e1" }}>Katalog Sembako</Link>
              <Link href="/lacak-pesanan" style={{ color: "#cbd5e1" }}>Lacak Status Pesanan</Link>
              <a href={`https://wa.me/${cleanPhone}?text=Halo%20Admin,%20saya%20mau%20tanya%20stok`} target="_blank" rel="noopener noreferrer" style={{ color: "#cbd5e1" }}>
                Tanya Stok via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Admin button */}
        <div
          style={{
            paddingTop: "2rem",
            borderTop: "1px solid #1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.8rem",
          }}
        >
          <div>© {new Date().getFullYear()} {settings.storeName}. Hak Cipta Dilindungi.</div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ color: "#64748b" }}>Sistem Toko Sembako Grosir & Eceran Online</span>
            <Link
              href="/admin"
              className="btn btn-secondary btn-sm"
              title="Masuk ke Panel Pengaturan Toko"
              style={{
                backgroundColor: "#1e293b",
                color: "#94a3b8",
                borderColor: "#334155",
                fontSize: "0.75rem",
                padding: "0.3rem 0.65rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <ShieldCheck size={14} color="#10b981" />
              <span>Panel Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
