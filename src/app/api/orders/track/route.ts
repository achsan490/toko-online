import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Mohon masukkan No. Invoice atau No. WhatsApp" },
        { status: 400 }
      );
    }

    const orders = await db.getOrders();
    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, "");

    const matchingOrders = orders.filter((o) => {
      const invClean = o.invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, "");
      const phoneClean = o.customerPhone.replace(/[^0-9]/g, "");
      return invClean.includes(cleanQuery) || phoneClean.includes(cleanQuery);
    });

    if (matchingOrders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Pesanan tidak ditemukan. Periksa kembali nomor invoice atau nomor WhatsApp Anda.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: matchingOrders[0],
      allMatches: matchingOrders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal melacak pesanan" },
      { status: 500 }
    );
  }
}
