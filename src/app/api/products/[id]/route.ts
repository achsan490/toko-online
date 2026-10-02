import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.getProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat produk" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.getProductById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updated = await db.saveProduct({
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui produk" },
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
    const deleted = await db.deleteProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
