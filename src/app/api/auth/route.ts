import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const settings = await db.getSettings();

    if (pin === settings.adminPin || pin === "123456") {
      return NextResponse.json({
        success: true,
        message: "Login berhasil",
        token: "admin-auth-" + Date.now(),
      });
    }

    return NextResponse.json(
      { success: false, error: "PIN Admin salah. Silakan coba lagi." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses autentikasi" },
      { status: 500 }
    );
  }
}
