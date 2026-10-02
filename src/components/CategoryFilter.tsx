"use client";

import React from "react";
import { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div
      style={{
        margin: "1rem 0 1.5rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
        scrollbarWidth: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          minWidth: "max-content",
        }}
      >
        <button
          onClick={() => onSelectCategory("all")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "1px solid",
            borderColor: selectedCategory === "all" ? "var(--primary)" : "var(--border)",
            backgroundColor: selectedCategory === "all" ? "var(--primary)" : "#ffffff",
            color: selectedCategory === "all" ? "#ffffff" : "var(--text-main)",
            boxShadow: selectedCategory === "all" ? "0 2px 6px rgba(5, 150, 105, 0.25)" : "none",
            transition: "all var(--transition-fast)",
            cursor: "pointer",
          }}
        >
          <span>🛒</span>
          <span>Semua Produk</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "1px solid",
                borderColor: isSelected ? "var(--primary)" : "var(--border)",
                backgroundColor: isSelected ? "var(--primary)" : "#ffffff",
                color: isSelected ? "#ffffff" : "var(--text-main)",
                boxShadow: isSelected ? "0 2px 6px rgba(5, 150, 105, 0.25)" : "none",
                transition: "all var(--transition-fast)",
                cursor: "pointer",
              }}
            >
              <span>{cat.icon || "📦"}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
