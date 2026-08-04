"use client";

import React, { useState } from "react";
import { PRODUCTS } from "../../data/products";
import { useCart } from "../../context/CartContext";

const CATEGORIES = ["All", "Cakes", "Donuts", "Fudge"];

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { addToCart } = useCart();

  const filteredProducts = PRODUCTS.filter((item: any) => {
    if (selectedCategory === "All") return true;
    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getProductPrice = (product: any): number => {
    if (typeof product.price === "number" && product.price > 0) return product.price;
    if (product.weightOptions && product.weightOptions.length > 0) {
      return product.weightOptions[0].price;
    }
    return product.pricePerPiece || 0;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2C1810] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Artisan Bakery Menu</h1>
          <p className="text-xs text-[#6E5448] mt-2">Explore our eggless creations made fresh daily for online order and pickup.</p>
        </header>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-[#EA580C] text-white shadow-sm"
                  : "bg-[#F7F2EB] text-[#2C1810] border border-[#E2D9CC] hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => {
            const price = getProductPrice(product);
            return (
              <div
                key={product.id}
                className="bg-white border border-[#E2D9CC] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 bg-gray-100 overflow-hidden relative">
                    <img
                      src={product.image || product.imageUrl || "/placeholder-cake.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base text-[#2C1810]">{product.name}</h3>
                    <p className="text-xs text-[#6E5448] mt-1 line-clamp-2">{product.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
                  <span className="text-sm font-extrabold text-[#2C1810]">₹{price}</span>
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: price,
                        image: product.image || product.imageUrl,
                        category: product.category,
                      })
                    }
                    className="bg-[#EA580C] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}