"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { auth } from "../lib/firebase";

interface CakeProps {
  id: string;
  name: string;
  image: string;
  description: string;
  basePrice: number;
}

export const CakeCard = ({ id, name, image, description, basePrice }: CakeProps) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState("0.5 kg");
  const [selectedShape, setSelectedShape] = useState("Circle");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const weightMultipliers: Record<string, number> = {
    "0.5 kg": 1,
    "1 kg": 1.8,
    "1.5 kg": 2.6,
    "2 kg": 3.4,
  };

  const unitPrice = Math.round(basePrice * (weightMultipliers[selectedWeight] || 1));
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
        cartId: `${id}-${selectedWeight}-${selectedShape}`,
        id,
        name,
        category: "cake",
        image,
        selectedWeight,
        selectedShape,
        quantity,
        price: unitPrice,
        totalPrice,
      });

      if (added) {
        setNotice(`Added ${name} (${selectedWeight}, ${selectedShape}) to your cart.`);
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
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              100% Eggless
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">{description}</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Select Weight:</label>
            <div className="grid grid-cols-4 gap-1">
              {["0.5 kg", "1 kg", "1.5 kg", "2 kg"].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeight(w)}
                  className={`text-xs py-1 rounded-md border font-medium ${
                    selectedWeight === w
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Select Shape:</label>
            <div className="grid grid-cols-3 gap-1">
              {["Circle", "Heart", "Square"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedShape(s)}
                  className={`text-xs py-1 rounded-md border font-medium ${
                    selectedShape === s
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
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
      </div>
    </div>
  );
};