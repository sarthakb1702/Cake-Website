"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { auth } from "../lib/firebase";
import type { Product } from "../types";

interface ProductDetailViewProps {
  product: Product;
}

export const ProductDetailView = ({ product }: ProductDetailViewProps) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState("0.5 kg");
  const [selectedShape, setSelectedShape] = useState("Circle");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isCake = product.category === "cake";
  const isDonut = product.category === "donut";
  const isFudge = product.category === "fudge";

  const unitPrice = useMemo(() => {
    if (isCake) {
      const weightMultipliers: Record<string, number> = {
        "0.5 kg": 1,
        "1 kg": 1.8,
        "1.5 kg": 2.6,
        "2 kg": 3.4,
      };
      const basePrice = product.weightOptions[0].price;
      return Math.round(basePrice * (weightMultipliers[selectedWeight] || 1));
    }

    if (isDonut) {
      return quantity >= 6 ? 50 : product.pricePerPiece;
    }

    return product.weightOptions[0].price;
  }, [isCake, isDonut, product, quantity, selectedWeight]);

  const totalPrice = useMemo(() => {
    if (isCake) return unitPrice * quantity;
    if (isDonut) return unitPrice * quantity;
    return unitPrice * quantity;
  }, [isCake, isDonut, quantity, unitPrice]);

  const handleAddToCart = async () => {
    setNotice(null);

    if (!auth.currentUser) {
      setNotice("Please sign in to add items to your cart.");
      router.push("/login");
      return;
    }

    setIsAdding(true);
    try {
      const added = await addToCart({
        cartId: isCake
          ? `${product.id}-${selectedWeight}-${selectedShape}`
          : isDonut
            ? `${product.id}-donut`
            : `${product.id}-fudge`,
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        quantity,
        price: unitPrice,
        totalPrice,
        ...(isCake ? { selectedWeight, selectedShape } : {}),
      });

      if (added) {
        setNotice(`Added ${product.name} to your cart.`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:flex-row md:p-8">
      <img src={product.image} alt={product.name} className="h-80 w-full rounded-2xl object-cover md:w-[45%]" />

      <div className="flex flex-1 flex-col gap-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">{product.category}</p>
          <h1 className="text-3xl font-black text-stone-900">{product.name}</h1>
          <p className="text-sm leading-6 text-stone-600">{product.description}</p>
        </div>

        {isCake && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">Weight</label>
              <div className="flex flex-wrap gap-2">
                {product.weightOptions.map((option) => (
                  <button
                    key={option.weight}
                    type="button"
                    onClick={() => setSelectedWeight(option.weight)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                      selectedWeight === option.weight
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-stone-200 bg-stone-50 text-stone-700"
                    }`}
                  >
                    {option.weight}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">Shape</label>
              <div className="flex flex-wrap gap-2">
                {product.availableShapes.map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setSelectedShape(shape)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                      selectedShape === shape
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-stone-200 bg-stone-50 text-stone-700"
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isDonut && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="rounded-lg border border-stone-200 px-3 py-2 text-lg font-semibold text-stone-700"
              >
                -
              </button>
              <span className="min-w-10 text-center text-lg font-black text-stone-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-lg font-semibold text-stone-700"
              >
                +
              </button>
            </div>
          </div>
        )}

        {isFudge && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Pack Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="rounded-lg border border-stone-200 px-3 py-2 text-lg font-semibold text-stone-700"
              >
                -
              </button>
              <span className="min-w-10 text-center text-lg font-black text-stone-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-lg font-semibold text-stone-700"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Price</p>
              <p className="text-2xl font-black text-stone-900">₹{totalPrice}</p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
          {notice && <p className="mt-3 text-sm text-amber-700">{notice}</p>}
        </div>
      </div>
    </div>
  );
};
