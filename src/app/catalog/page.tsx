"use client";

import React, { useState } from "react";
import { useProductsStore } from "@/lib/products-store";
import { ProductCard } from "@/components/ProductCard";

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { products } = useProductsStore();

  const customCategories = Array.from(
    new Set(
      products
        .map((p: any) => p.category)
        .filter((c: any) => Boolean(c) && !["cake", "donut", "fudge"].includes(String(c).toLowerCase()))
    )
  ).map((c: any) => String(c).charAt(0).toUpperCase() + String(c).slice(1));

  const categories = ["All", "Cakes", "Donuts", "Fudge", ...customCategories];

  const filteredProducts = products.filter((item: any) => {
    if (selectedCategory === "All") return true;
    const cat = item.category?.toLowerCase() || "";
    if (selectedCategory === "Cakes") return cat === "cake" || cat === "cakes";
    if (selectedCategory === "Donuts") return cat === "donut" || cat === "donuts";
    if (selectedCategory === "Fudge") return cat === "fudge";
    return cat === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-3.5 py-1 text-[11px] font-extrabold tracking-wider text-amber-900 uppercase">
            Full Bakery Menu
          </span>
          <h1 className="text-4xl font-black uppercase text-stone-900 mt-2">Artisan Bakery Catalog</h1>
          <p className="text-xs text-stone-500 mt-2 max-w-md mx-auto">
            Explore our 100% eggless handcrafted cakes, donuts, and fudge baked fresh daily. Select your custom weight and shape options directly on the product card!
          </p>
        </header>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}