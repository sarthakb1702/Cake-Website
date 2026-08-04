"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { auth } from "../lib/firebase";

interface FudgeProps {
  id: string;
  name: string;
  image: string;
  description: string;
  pricePer250g: number;
}

export const FudgeCard = ({ id, name, image, description, pricePer250g }: FudgeProps) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState("250 g");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const weightMultipliers: Record<string, number> = {
    "250 g": 1,
    "500 g": 1.8,
    "750 g": 2.6,
    "1 kg": 3.4,
  };

  const unitPrice = Math.round(pricePer250g * (weightMultipliers[selectedWeight] || 1));
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
        cartId: `${id}-${selectedWeight}`,
        id,
        name,
        category: "fudge",
        image,
        selectedWeight,
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
          <h3 className="text-lg font-bold text-stone-900">{name}</h3>
          <p className="text-xs text-stone-500 mt-1">{description}</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">Select Weight:</label>
            <div className="grid grid-cols-4 gap-1">
              {['250 g', '500 g', '750 g', '1 kg'].map((weight) => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => setSelectedWeight(weight)}
                  className={`rounded-md border px-2 py-1.5 text-xs font-semibold transition ${
                    selectedWeight === weight
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>

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
        </div>

        <div className="space-y-2 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 block">Total</span>
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

          {notice && <p className="text-xs text-amber-700">{notice}</p>}
        </div>
      </div>
    </div>
  );
};