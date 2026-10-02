import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Product } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("activeOnly") === "true";

    let products = await db.getProducts();

    if (activeOnly) {
      products = products.filter((p) => p.isActive);
    }

    if (category && category !== "all") {
      products = products.filter((p) => p.categoryId === category);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Failed to get products:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat produk" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      categoryId,
      description,
      unit,
      regularPrice,
      originalPrice,
      stock,
      imageUrl,
      tierPrices,
      isActive,
      isFeatured,
      minOrder,
    } = body;

    if (!name || !categoryId || !regularPrice || !unit) {
      return NextResponse.json(
        { success: false, error: "Mohon isi nama, kategori, satuan, dan harga produk" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);

    const newProduct: Product = {
      id: "prod-" + Date.now(),
      name,
      slug,
      categoryId,
      description: description || "",
      unit: unit || "pcs",
      regularPrice: Number(regularPrice),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: Number(stock) || 0,
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
      tierPrices: Array.isArray(tierPrices) ? tierPrices : [],
      isActive: isActive !== false,
      isFeatured: Boolean(isFeatured),
      minOrder: Number(minOrder) || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.saveProduct(newProduct);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat produk baru" },
      { status: 500 }
    );
  }
}
