import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat pengaturan toko" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await db.updateSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
