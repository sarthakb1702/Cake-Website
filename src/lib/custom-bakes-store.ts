"use client";

import { useState, useEffect } from "react";

export interface CustomBakeStep {
  n: string;
  title: string;
  copy: string;
}

export interface CustomBakesData {
  sectionTitle: string;
  sectionSubtitle: string;
  sponges: string[];
  flavors: string[];
  tierOptions: string[];
  basePrice: number;
  steps: CustomBakeStep[];
}

export const INITIAL_CUSTOM_BAKES: CustomBakesData = {
  sectionTitle: "Custom cakes",
  sectionSubtitle: "Build a cake that's only yours",
  sponges: ["Classic Vanilla Sponge", "Dark Chocolate Cocoa Sponge", "Red Velvet Sponge", "Almond Flour Sponge"],
  flavors: ["Belgian Dark Chocolate", "Fresh Strawberry Cream", "Nutella Hazelnut Truffle", "Salted Caramel Pecan"],
  tierOptions: ["Single Tier (0.5kg - 2kg)", "Two Tiers (2.5kg - 4kg)", "Three Tiers (5kg+)"],
  basePrice: 650,
  steps: [
    { n: "01", title: "Choose shape & weight", copy: "Round, Heart, or Square shapes from 0.5kg to 2.0kg." },
    { n: "02", title: "100% Eggless Sponges", copy: "Rich Belgian chocolate, Red Velvet, or classic fruit layers." },
    { n: "03", title: "Custom Message & Order", copy: "Add custom piped message & schedule express pickup." },
  ],
};

const STORAGE_KEY = "shreyas_bakery_custom_bakes_data";

export function getStoredCustomBakes(): CustomBakesData {
  if (typeof window === "undefined") return INITIAL_CUSTOM_BAKES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error loading Custom Bakes data:", e);
  }
  return INITIAL_CUSTOM_BAKES;
}

export function saveCustomBakes(data: CustomBakesData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("custom-bakes-data-updated"));
  } catch (e) {
    console.error("Error saving Custom Bakes data:", e);
  }
}

export function useCustomBakesStore() {
  const [customBakes, setCustomBakes] = useState<CustomBakesData>(INITIAL_CUSTOM_BAKES);

  useEffect(() => {
    setCustomBakes(getStoredCustomBakes());
    const handleUpdate = () => setCustomBakes(getStoredCustomBakes());
    window.addEventListener("custom-bakes-data-updated", handleUpdate);
    return () => window.removeEventListener("custom-bakes-data-updated", handleUpdate);
  }, []);

  const updateCustomBakes = (updatedFields: Partial<CustomBakesData>) => {
    const current = getStoredCustomBakes();
    const updated = { ...current, ...updatedFields };
    saveCustomBakes(updated);
  };

  return { customBakes, updateCustomBakes };
}
