import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Category } from "@/types";

export async function GET() {
  try {
    const categories = await db.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat kategori" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, icon, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const categories = await db.getCategories();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newCategory: Category = {
      id: "cat-" + Date.now(),
      name,
      slug,
      icon: icon || "📦",
      description: description || "",
      order: categories.length + 1,
    };

    const saved = await db.saveCategory(newCategory);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}
