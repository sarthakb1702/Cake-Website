"use client";

import React, { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getSafeProductMetadata } from "@/lib/product-helpers";
import { QuickViewModal } from "./QuickViewModal";
import { Edit3, Eye, Tag, ShoppingBag, CheckCircle2 } from "lucide-react";

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart } = useCart();
  const { currentUser, userRole } = useAuth();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const hideEcommerce = userRole === "admin" || pathname?.startsWith("/admin");

  const metadata = useMemo(() => getSafeProductMetadata(product), [product]);
  const activeVariants = metadata.weightVariants;
  const availableShapes = metadata.shapesList;

  const [selectedWeight, setSelectedWeight] = useState(metadata.defaultWeight);
  const [selectedShape, setSelectedShape] = useState(availableShapes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const category = (product?.category || "").toLowerCase();
  const isCake = category === "cake" || category === "cakes";
  const isDonut = category === "donut" || category === "donuts";
  const isFudge = category === "fudge";

  const selectedVariant = useMemo(() => {
    return activeVariants.find(
      (v) => v.weight.toLowerCase().trim() === selectedWeight.toLowerCase().trim()
    ) || activeVariants[0];
  }, [activeVariants, selectedWeight]);

  const unitPrice = useMemo(() => {
    if (isDonut) {
      return quantity >= 6 ? 50 : (product.pricePerPiece || product.price || 70);
    }
    return selectedVariant?.price || metadata.basePrice;
  }, [isDonut, metadata.basePrice, product.price, product.pricePerPiece, quantity, selectedVariant]);

  const totalPrice = unitPrice * quantity;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
        ...(isCake && selectedShape ? { selectedShape } : {}),
      });

      if (added) {
        setNotice(`Added ${product.name} (${selectedWeight}${selectedShape ? `, ${selectedShape}` : ""})!`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const fullProduct: Product = {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.image,
    price: unitPrice,
    isEggless: true,
    weightVariants: activeVariants,
    shapes: availableShapes,
  };

  return (
    <>
      <div
        onClick={() => setIsQuickViewOpen(true)}
        className="group bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative min-h-[520px] h-full"
      >
        {/* Card Header & Image */}
        <div className="relative overflow-hidden h-48 bg-stone-100 border-b border-stone-100 shrink-0">
          <img
            src={product.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 bg-[#fdf2f4] border border-[#f8d7da] text-[#e8647c] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
            100% Eggless
          </span>

          {isDonut && (
            <span className="absolute top-3 right-3 bg-[#e8647c] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Tag className="w-3 h-3" /> Buy 6+ @ ₹50
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-stone-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 transition-opacity opacity-90 hover:opacity-100"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-stone-900 leading-snug line-clamp-1">{product.name}</h3>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQuickViewOpen(true);
                }}
                className="bg-[#fdf2f4] text-[#e8647c] border border-[#f8d7da] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shrink-0 hover:bg-[#fce4e8] transition-colors"
              >
                ₹{unitPrice} / {selectedWeight}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 line-clamp-2">{product.description}</p>
          </div>

          {/* Interactive Weight & Shape Selectors */}
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* Weight Chips */}
            {activeVariants.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1 uppercase tracking-wider">
                  Weight Option:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeVariants.map((v) => (
                    <button
                      key={v.weight}
                      type="button"
                      onClick={() => setSelectedWeight(v.weight)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        selectedWeight === v.weight
                          ? "bg-[#e8647c] text-white border-[#e8647c] shadow-xs"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-rose/10 hover:border-rose/30"
                      }`}
                    >
                      {v.weight} {v.price > 0 && `(₹${v.price})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shape Chips */}
            {availableShapes.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1 uppercase tracking-wider">
                  Shape Choice:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableShapes.map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setSelectedShape(shape)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        selectedShape === shape
                          ? "bg-[#e8647c] text-white border-[#e8647c] shadow-xs"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-rose/10 hover:border-rose/30"
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Donut Bulk Offer Alert */}
            {isDonut && (
              <div className="rounded-xl bg-[#fdf2f4] p-2 border border-[#f8d7da] flex items-center gap-1.5 text-[11px] text-[#e8647c] font-medium">
                <Tag className="w-3.5 h-3.5 text-[#e8647c] shrink-0" />
                <span>Buy <strong>6+ donuts</strong> & get each for <strong>₹50</strong>!</span>
              </div>
            )}
          </div>

          {/* Footer & Add to Cart Action */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                Total Price
              </span>
              <span className="text-xl font-black text-stone-900">₹{totalPrice}</span>
            </div>

            {!hideEcommerce ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="rounded-full bg-[#e8647c] hover:bg-[#d5526a] px-5 py-2.5 text-xs font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
            ) : (
              <Link
                href={`/admin/products/${product.id}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-full bg-[#fdf2f4] px-3.5 py-2 text-xs font-bold text-[#e8647c] hover:bg-[#fce4e8] transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Manage
              </Link>
            )}
          </div>

          {notice && (
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </div>
      </div>

      <QuickViewModal
        product={fullProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};
