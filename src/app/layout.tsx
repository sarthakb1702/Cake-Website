import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "../components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext"; // 1. Import AuthProvider
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SweetStudio Bakery",
  description: "Freshly baked cakes, donuts, and fudge delivered to your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 flex flex-col text-gray-900 antialiased`}>
        {/* 2. Wrap with AuthProvider and CartProvider */}
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}