"use client";

import React from "react";
import { Sparkles, TrendingDown, Truck, PhoneCall } from "lucide-react";
import { StoreSettings } from "@/types";

interface HeroBannerProps {
  settings: StoreSettings;
}

export default function HeroBanner({ settings }: HeroBannerProps) {
  return (
    <section
      style={{
        margin: "1.25rem 0",
      }}
    >
      <div className="container">
        <div
          style={{
            background: "linear-gradient(135deg, #064e3b 0%, #059669 50%, #047857 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem 1.5rem",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.4)",
          }}
        >
          {/* Decorative background glow circles */}
          <div
            style={{
              position: "absolute",
              right: "-50px",
              top: "-50px",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "40%",
              bottom: "-80px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "760px",
            }}
          >
            {/* Tag / Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "rgba(254, 243, 199, 0.2)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(253, 230, 138, 0.4)",
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#fef3c7",
                marginBottom: "0.875rem",
              }}
            >
              <Sparkles size={16} color="#f59e0b" />
              <span>SISTEM HARGA GROSIR BERTINGKAT</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.35rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#ffffff",
                marginBottom: "0.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              {settings.heroBannerTitle || "Pusat Sembako Murah Eceran & Grosir"}
            </h1>

            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.55,
                color: "rgba(255, 255, 255, 0.9)",
                marginBottom: "1.5rem",
                maxWidth: "640px",
              }}
            >
              {settings.heroBannerSubtitle ||
                "Beli 1 eceran, beli lebih dari 2 langsung dapat harga grosir murah! Sangat hemat untuk kebutuhan rumah tangga, warung, dan restoran."}
            </p>

            {/* Feature Pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(6px)",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                <TrendingDown size={18} color="#fcd34d" />
                <span>Makin Banyak Beli, Makin Hemat</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(6px)",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                <PhoneCall size={18} color="#86efac" />
                <span>Pesan Cepat via WhatsApp</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(6px)",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                <Truck size={18} color="#93c5fd" />
                <span>Bisa Antar ke Rumah / Ambil Sendiri</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
