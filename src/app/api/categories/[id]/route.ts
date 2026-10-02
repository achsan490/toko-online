import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updated = await db.saveCategory({
      ...existing,
      ...body,
      id,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteCategory(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
