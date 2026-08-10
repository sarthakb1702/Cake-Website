"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useProductsStore } from "@/lib/products-store";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Edit3, Tag } from "lucide-react";
import { AdminEditButton } from "@/components/AdminEditButton";

export default function DonutsPage() {
  const pathname = usePathname();
  const { products } = useProductsStore();
  const { addToCart } = useCart();
  const { userRole } = useAuth();

  const hideEcommerce = userRole === "admin" || pathname?.startsWith("/admin");

  const donuts = products.filter((p) => p.category?.toLowerCase() === "donut" || p.category?.toLowerCase() === "donuts");

  return (
    <div className="min-h-screen bg-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="inline-block rounded-full bg-secondary px-3.5 py-1 text-[11px] font-bold tracking-wider text-chocolate uppercase">
            Fresh Pastries
          </span>
          <h1 className="font-display text-4xl font-black uppercase text-chocolate mt-2">Belgian Glazed Donuts</h1>
          <p className="text-xs text-muted-foreground mt-1">Soft, fluffy 100% eggless donuts dipped in rich chocolate glazes.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donuts.map((product) => {
            const price = product.price || product.pricePerPiece || 70;
            return (
              <div
                key={product.id}
                className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-soft flex flex-col justify-between relative"
              >
                <div>
                  <div className="h-56 bg-cream overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-secondary text-chocolate text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      100% Eggless
                    </span>
                    <span className="absolute top-3 right-3 bg-[#E86A7A] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-badge flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Buy 6+ @ ₹50
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-xl text-chocolate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{product.description}</p>
                    <div className="mt-3 rounded-xl bg-blush/70 p-2.5 border border-[#F6D0D5] flex items-center gap-1.5 text-[11px] text-chocolate font-medium">
                      <Tag className="h-3.5 w-3.5 text-[#E86A7A] shrink-0" />
                      <span>Special Offer: Add 6 or more donuts & get each for ₹50!</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-3">
                  <div className="flex flex-col">
                    <span className="font-display text-xl font-black text-rose">₹{price}</span>
                    <span className="text-[10px] font-bold text-chocolate">₹50/pc on 6+ units</span>
                  </div>
                  {!hideEcommerce ? (
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: price,
                          image: product.image,
                          category: product.category,
                        })
                      }
                      className="bg-rose text-white px-6 py-2.5 rounded-full text-xs font-bold hover:brightness-110 transition-all shadow-badge cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <AdminEditButton href={`/admin/products/${product.id}/edit`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
