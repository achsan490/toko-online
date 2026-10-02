import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Order, OrderItem } from "@/types";
import { calculateOrderItem } from "@/lib/pricing";

export async function GET() {
  try {
    const orders = await db.getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar pesanan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      notes,
      deliveryMethod,
      paymentMethod,
      cartItems,
    } = body;

    if (!customerName || !customerPhone || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }

    const settings = await db.getSettings();
    const calculatedItems: OrderItem[] = [];
    let subtotal = 0;
    let totalSavings = 0;

    for (const item of cartItems) {
      const product = await db.getProductById(item.productId);
      if (!product) continue;
      const orderItem = calculateOrderItem(product, item.quantity);
      calculatedItems.push(orderItem);
      subtotal += orderItem.subtotal;
      totalSavings += orderItem.savings;
    }

    if (calculatedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Produk tidak valid atau tidak ditemukan" },
        { status: 400 }
      );
    }

    const isDelivery = deliveryMethod === "DELIVERY";
    const deliveryFee =
      isDelivery && subtotal < settings.freeDeliveryMin
        ? settings.deliveryFee
        : 0;

    const totalAmount = subtotal + deliveryFee;

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${todayStr}-${randomSuffix}`;

    const newOrder: Order = {
      id: "ord-" + Date.now(),
      invoiceNumber,
      customerName,
      customerPhone,
      customerAddress: customerAddress || "-",
      notes: notes || "",
      deliveryMethod: deliveryMethod || "DELIVERY",
      paymentMethod: paymentMethod || "WHATSAPP",
      paymentStatus: "UNPAID",
      orderStatus: "PENDING",
      items: calculatedItems,
      subtotal,
      deliveryFee,
      totalAmount,
      totalSavings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createOrder(newOrder);

    // Build WhatsApp message text
    let waText = `🛒 *PESANAN BARU - ${settings.storeName.toUpperCase()}*\n`;
    waText += `*No. Invoice:* ${saved.invoiceNumber}\n\n`;
    waText += `👤 *Data Pemesan:*\n`;
    waText += `• Nama: ${saved.customerName}\n`;
    waText += `• No. HP/WA: ${saved.customerPhone}\n`;
    waText += `• Alamat: ${saved.customerAddress}\n`;
    if (saved.notes) waText += `• Catatan: ${saved.notes}\n`;
    waText += `\n📦 *Rincian Belanja:*\n`;

    saved.items.forEach((item, idx) => {
      const tierTag = item.tierLabel ? ` _(${item.tierLabel})_` : "";
      waText += `${idx + 1}. *${item.productName}*\n`;
      waText += `   ${item.quantity} ${item.unit} x Rp ${item.priceApplied.toLocaleString("id-ID")}${tierTag} = *Rp ${item.subtotal.toLocaleString("id-ID")}*\n`;
    });

    waText += `\n--------------------------------\n`;
    waText += `Subtotal: Rp ${saved.subtotal.toLocaleString("id-ID")}\n`;
    if (saved.deliveryFee > 0) {
      waText += `Ongkir: Rp ${saved.deliveryFee.toLocaleString("id-ID")}\n`;
    } else if (isDelivery) {
      waText += `Ongkir: *GRATIS*\n`;
    }
    waText += `💰 *TOTAL AKHIR: Rp ${saved.totalAmount.toLocaleString("id-ID")}*\n`;
    if (saved.totalSavings > 0) {
      waText += `🎉 *Anda Hemat Grosir: Rp ${saved.totalSavings.toLocaleString("id-ID")}*\n`;
    }
    waText += `--------------------------------\n`;
    waText += `🛵 Pengiriman: ${saved.deliveryMethod === "DELIVERY" ? "Diantar ke Rumah" : "Ambil Sendiri di Toko"}\n`;
    waText += `💳 Pembayaran: ${saved.paymentMethod}\n\n`;
    waText += `Mohon segera dikonfirmasi dan diproses ya Admin, terima kasih! 🙏`;

    const adminPhoneClean = settings.whatsappNumber.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${adminPhoneClean}?text=${encodeURIComponent(waText)}`;

    return NextResponse.json({
      success: true,
      data: saved,
      whatsappUrl: waUrl,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}
