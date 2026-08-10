"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getSafeProductMetadata } from "@/lib/product-helpers";
import { X, Edit3, ShoppingBag, CheckCircle2 } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart } = useCart();
  const { currentUser, userRole } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedShape, setSelectedShape] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const hideEcommerce = userRole === "admin" || pathname?.startsWith("/admin");

  const metadata = useMemo(() => {
    if (!product) return null;
    return getSafeProductMetadata(product);
  }, [product]);

  useEffect(() => {
    if (metadata) {
      setSelectedWeight(metadata.defaultWeight || "");
      setSelectedShape(metadata.shapesList[0] || "");
      setQuantity(1);
      setNotice(null);
    }
  }, [metadata, product]);

  if (!isOpen || !product || !metadata) return null;

  const category = (product.category || "").toLowerCase();
  const isCake = category === "cake" || category === "cakes";
  const isDonut = category === "donut" || category === "donuts";
  const isFudge = category === "fudge";

  const selectedVariant = metadata.weightVariants.find(
    (v) => v.weight.toLowerCase().trim() === selectedWeight.toLowerCase().trim()
  ) || metadata.weightVariants[0];

  const unitPrice = isDonut
    ? quantity >= 6 ? 50 : (product.pricePerPiece || product.price || 70)
    : (selectedVariant?.price || metadata.basePrice || 300);

  const totalPrice = unitPrice * quantity;

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
        setNotice(`Added ${product.name} (${selectedWeight}) to your cart!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-stone-100 text-stone-600 transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-stone-100 shrink-0">
          <img
            src={product.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-4 left-4 bg-[#fdf2f4] border border-[#f8d7da] text-[#e8647c] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            100% Eggless
          </span>
        </div>

        {/* Content & Options */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between overflow-y-auto space-y-5">
          <div>
            <span className="text-[11px] font-extrabold tracking-widest text-[#e8647c] uppercase">
              {product.category || "Artisan Bake"}
            </span>
            <h2 className="text-2xl font-black text-stone-900 mt-1">{product.name}</h2>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            {/* Weight Option Selector */}
            {metadata.weightVariants.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Select Weight / Portion:
                </label>
                <div className="flex flex-wrap gap-2">
                  {metadata.weightVariants.map((v) => (
                    <button
                      key={v.weight}
                      type="button"
                      onClick={() => setSelectedWeight(v.weight)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                        selectedWeight === v.weight
                          ? "bg-[#e8647c] text-white border-[#e8647c] shadow-sm"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-rose/10 hover:border-rose/30"
                      }`}
                    >
                      {v.weight} {v.price > 0 && `(₹${v.price})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shape Selector (Cakes) */}
            {isCake && metadata.shapesList.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Select Shape:
                </label>
                <div className="flex flex-wrap gap-2">
                  {metadata.shapesList.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setSelectedShape(shape)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                        selectedShape === shape
                          ? "bg-[#e8647c] text-white border-[#e8647c] shadow-sm"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-rose/10 hover:border-rose/30"
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Quantity:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-200 rounded-l-xl transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-black text-stone-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-200 rounded-r-xl transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {isDonut && quantity >= 6 && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    🎉 ₹50/pc Offer Active!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Add to Cart Footer */}
          <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block">Total Amount</span>
                <span className="text-2xl font-black text-stone-900">₹{totalPrice}</span>
              </div>

              {!hideEcommerce ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="rounded-2xl bg-[#e8647c] hover:bg-[#d5526a] px-6 py-3 text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>
              ) : (
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-[#fdf2f4] px-5 py-2.5 text-xs font-bold text-[#e8647c] hover:bg-[#fce4e8] transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Manage Product
                </Link>
              )}
            </div>

            {notice && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
