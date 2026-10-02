import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Berkah Mart - Toko Sembako & Minimarket Grosir Online",
  description: "Belanja kebutuhan pokok dan sembako murah eceran dan grosir. Pesan mudah via website dan WhatsApp langsung antar!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
