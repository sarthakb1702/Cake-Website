"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { auth } from "../lib/firebase";
import { Tag } from "lucide-react";

interface DonutProps {
  id: string;
  name: string;
  image: string;
  description: string;
  basePricePerPiece?: number;
}

export const DonutCard = ({ id, name, image, description, basePricePerPiece = 80 }: DonutProps) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isBulkDiscount = quantity >= 6;
  const unitPrice = isBulkDiscount ? 50 : basePricePerPiece;
  const totalPrice = unitPrice * quantity;

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
        cartId: `${id}-donut`,
        id,
        name,
        category: "donut",
        image,
        quantity,
        price: unitPrice,
        totalPrice,
      });

      if (added) {
        setNotice(`Added ${quantity} x ${name} to your cart.`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900">{name}</h3>
            {isBulkDiscount && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" /> Bulk Discount!
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">{description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-600">Quantity:</label>
            <div className="flex items-center border border-stone-200 rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                -
              </button>
              <span className="px-3 text-xs font-bold text-stone-800">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                +
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-500">
            {quantity < 6 ? (
              <span>Buy <strong>6 or more</strong> for <strong>₹50/pc</strong> (Save ₹30/pc)</span>
            ) : (
              <span className="text-emerald-700 font-semibold">Bulk Price Unlocked: ₹50/pc</span>
            )}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block">
              ₹{unitPrice} × {quantity}
            </span>
            <span className="text-lg font-extrabold text-stone-900">₹{totalPrice}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};