"use client";

import { useState, useEffect } from "react";

export interface BakeOfTheMonthData {
  id: string;
  badgeText: string;
  title: string;
  description: string;
  price: number;
  image: string;
  highlights: string[];
  catalogProductId?: string;
}

export const INITIAL_BAKE_OF_MONTH: BakeOfTheMonthData = {
  id: "bake-of-month-1",
  badgeText: "BAKE OF THE MONTH",
  title: "Belgian Dark Chocolate Truffle",
  description:
    "Rich, smooth 100% eggless Belgian chocolate layered with dark cocoa sponge. Baked in small batches every morning for maximum freshness and velvety melt-in-the-mouth texture.",
  price: 500,
  image:
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
  highlights: [
    "100% Eggless recipe",
    "Rich Belgian chocolate",
    "Freshly roasted nuts",
    "Zero artificial preservatives",
  ],
  catalogProductId: "cake-belgian-truffle",
};

const STORAGE_KEY = "shreyas_bakery_bake_of_month";

export function getStoredBakeOfMonth(): BakeOfTheMonthData {
  if (typeof window === "undefined") return INITIAL_BAKE_OF_MONTH;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading Bake of the Month:", e);
  }
  return INITIAL_BAKE_OF_MONTH;
}

export function saveBakeOfMonth(data: BakeOfTheMonthData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("bake-of-month-updated"));
  } catch (e) {
    console.error("Error saving Bake of the Month:", e);
  }
}

export function useBakeOfTheMonthStore() {
  const [data, setData] = useState<BakeOfTheMonthData>(INITIAL_BAKE_OF_MONTH);

  useEffect(() => {
    setData(getStoredBakeOfMonth());
    const handleUpdate = () => setData(getStoredBakeOfMonth());
    window.addEventListener("bake-of-month-updated", handleUpdate);
    return () => window.removeEventListener("bake-of-month-updated", handleUpdate);
  }, []);

  const updateBakeOfMonth = (updatedFields: Partial<BakeOfTheMonthData>) => {
    const current = getStoredBakeOfMonth();
    const updated = { ...current, ...updatedFields };
    saveBakeOfMonth(updated);
  };

  return {
    bakeOfMonth: data,
    updateBakeOfMonth,
  };
}
