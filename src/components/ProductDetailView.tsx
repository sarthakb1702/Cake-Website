"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";
import { Edit3 } from "lucide-react";

interface ProductDetailViewProps {
  product: Product;
}

export const ProductDetailView = ({ product }: ProductDetailViewProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart } = useCart();
  const { currentUser, userRole } = useAuth();
  const activeVariants = useMemo(() => {
    if (product.weightVariants && product.weightVariants.length > 0) return product.weightVariants;
    if (product.weightOptions && product.weightOptions.length > 0) return product.weightOptions;
    if (product.weights && product.weights.length > 0) {
      return product.weights.map((w) => ({ weight: w, price: product.price || 300 }));
    }
    if (product.category === "fudge") {
      const p = product.price || 300;
      return [
        { weight: "250g", price: p },
        { weight: "500g", price: Math.round(p * 1.8) },
        { weight: "750g", price: Math.round(p * 2.6) },
        { weight: "1kg", price: Math.round(p * 3.4) },
      ];
    }
    const baseP = product.price || 500;
    return [
      { weight: "0.5 kg", price: baseP },
      { weight: "1 kg", price: Math.round(baseP * 1.8) },
      { weight: "1.5 kg", price: Math.round(baseP * 2.6) },
      { weight: "2 kg", price: Math.round(baseP * 3.4) },
    ];
  }, [product]);

  const availableWeights = useMemo(() => activeVariants.map((v) => v.weight), [activeVariants]);

  const availableShapes = useMemo(() => {
    if (product.shapes && product.shapes.length > 0) return product.shapes;
    if (product.availableShapes && product.availableShapes.length > 0) return product.availableShapes;
    return ["Round", "Heart", "Square"];
  }, [product.shapes, product.availableShapes]);

  const [selectedWeight, setSelectedWeight] = useState(availableWeights[0] || "0.5 kg");
  const [selectedShape, setSelectedShape] = useState(availableShapes[0] || "Round");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const hideEcommerce = userRole === "admin" || pathname?.startsWith("/admin");

  const isCake = product.category === "cake";
  const isDonut = product.category === "donut";
  const isFudge = product.category === "fudge";

  const selectedVariant = useMemo(() => {
    return activeVariants.find(
      (v) => v.weight.toLowerCase().trim() === selectedWeight.toLowerCase().trim()
    ) || activeVariants[0];
  }, [activeVariants, selectedWeight]);

  const unitPrice = useMemo(() => {
    if (isDonut) {
      return quantity >= 6 ? 50 : (product.pricePerPiece || product.price || 70);
    }
    return selectedVariant?.price || product.price || 300;
  }, [isDonut, product, quantity, selectedVariant]);

  const totalPrice = useMemo(() => {
    return unitPrice * quantity;
  }, [quantity, unitPrice]);

  const handleAddToCart = async () => {
    setNotice(null);

    if (!currentUser) {
      setNotice("Please sign in to add items to your cart.");
      router.push("/login");
      return;
    }

    setIsAdding(true);
    try {
      const added = await addToCart({
        cartId: isCake
          ? `${product.id}-${selectedWeight}-${selectedShape}`
          : `${product.id}-${selectedWeight}`,
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        quantity,
        price: unitPrice,
        totalPrice,
        selectedWeight,
        ...(isCake ? { selectedShape } : {}),
      });

      if (added) {
        setNotice(`Added ${product.name} (${selectedWeight}) to your cart.`);
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

        {(isCake || isFudge) && (
          <div className="space-y-4">
            {activeVariants.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Weight Variant</label>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map((v) => (
                    <button
                      key={v.weight}
                      type="button"
                      onClick={() => setSelectedWeight(v.weight)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                        selectedWeight === v.weight
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {v.weight} {v.price > 0 && `(₹${v.price})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isCake && availableShapes.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Shape</label>
                <div className="flex flex-wrap gap-2">
                  {availableShapes.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setSelectedShape(shape)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                        selectedShape === shape
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Price</p>
              <p className="text-2xl font-black text-stone-900">₹{totalPrice}</p>
            </div>

            {!hideEcommerce ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
            ) : (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-200 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Manage Product
              </Link>
            )}
          </div>
          {notice && <p className="mt-3 text-sm text-amber-700">{notice}</p>}
        </div>
      </div>
    </div>
  );
};
