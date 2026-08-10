"use client";

import { useState, useEffect, useMemo } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useProductsStore, getStoredProducts } from "./products-store";
import { Product } from "@/types";

const BESTSELLERS_STORAGE_KEY = "crumb_co_bestseller_ids";

export function getBestsellerIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(BESTSELLERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading bestseller IDs:", e);
  }
  // Default to first 4 products
  const products = getStoredProducts();
  return products.slice(0, 4).map((p) => p.id);
}

export function saveBestsellerIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BESTSELLERS_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("bestsellers-updated"));
  } catch (e) {
    console.error("Error saving bestseller IDs:", e);
  }
}

export function useBestsellersStore() {
  const { products } = useProductsStore();
  const [bestsellerIds, setBestsellerIds] = useState<string[]>(getBestsellerIds());

  useEffect(() => {
    setBestsellerIds(getBestsellerIds());

    const handleUpdate = () => {
      setBestsellerIds(getBestsellerIds());
    };

    window.addEventListener("bestsellers-updated", handleUpdate);
    window.addEventListener("products-updated", handleUpdate);

    // Real-Time Firestore Sync Listener for Bestsellers
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, "settings", "bestsellers");
      unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.bestsellerIds)) {
              setBestsellerIds(data.bestsellerIds);
              saveBestsellerIds(data.bestsellerIds);
            }
          }
        },
        (err) => {
          console.warn("Firestore bestsellers listener notice:", err);
        }
      );
    } catch (e) {
      console.warn("Could not subscribe to Firestore bestsellers:", e);
    }

    return () => {
      window.removeEventListener("bestsellers-updated", handleUpdate);
      window.removeEventListener("products-updated", handleUpdate);
      unsubscribe();
    };
  }, []);

  const syncToFirestore = async (ids: string[]) => {
    try {
      const docRef = doc(db, "settings", "bestsellers");
      await setDoc(docRef, { bestsellerIds: ids, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn("Error saving bestsellers to Firestore:", e);
    }
  };

  const bestsellerProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (bestsellerIds.length === 0) return products.slice(0, 4);

    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));

    const selected: Product[] = [];
    bestsellerIds.forEach((id) => {
      if (map.has(id)) {
        selected.push(map.get(id)!);
      }
    });

    // Fallback if none matched
    return selected.length > 0 ? selected : products.slice(0, 4);
  }, [products, bestsellerIds]);

  const setBestsellers = (newIds: string[]) => {
    saveBestsellerIds(newIds);
    syncToFirestore(newIds);
  };

  const addBestseller = (productId: string) => {
    if (bestsellerIds.includes(productId)) return;
    const updated = [...bestsellerIds, productId];
    saveBestsellerIds(updated);
    syncToFirestore(updated);
  };

  const removeBestseller = (productId: string) => {
    const updated = bestsellerIds.filter((id) => id !== productId);
    saveBestsellerIds(updated);
    syncToFirestore(updated);
  };

  const moveBestseller = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= bestsellerIds.length) return;
    const updated = [...bestsellerIds];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    saveBestsellerIds(updated);
    syncToFirestore(updated);
  };

  return {
    bestsellerIds,
    bestsellerProducts,
    setBestsellers,
    addBestseller,
    removeBestseller,
    moveBestseller,
  };
}
