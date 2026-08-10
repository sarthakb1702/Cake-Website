import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Navbar } from "../components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Shreya's Home Bakery — Artisan Cake Shop",
  description: "Small-batch artisan cakes, cupcakes and pastries. Handcrafted daily, 100% eggless.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} font-sans min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-rose selection:text-white`}>
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