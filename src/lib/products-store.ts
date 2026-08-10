"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PRODUCTS as initialProducts } from "@/data/products";
import { Product } from "@/types";

const STORAGE_KEY = "crumb_co_custom_products";

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return initialProducts;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading stored products:", e);
  }
  return initialProducts;
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("products-updated"));
  } catch (e) {
    console.error("Error saving products:", e);
  }
}

export function useProductsStore() {
  const [products, setProducts] = useState<Product[]>(getStoredProducts());

  useEffect(() => {
    setProducts(getStoredProducts());

    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener("products-updated", handleUpdate);

    // Real-Time Firestore Sync Listener
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(
        collection(db, "products"),
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreProducts: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const img = data.image || data.imageUrl || data.photoUrl || data.bannerUrl || data.url || "";
              firestoreProducts.push({
                ...data,
                id: docSnap.id,
                name: data.name || data.title || "Untitled Product",
                price: Number(data.price) || 0,
                description: data.description || "",
                category: data.category || "cake",
                image: img || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700",
                imageUrl: img || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700",
                photoUrl: img || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700",
                bannerUrl: img || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700",
                weights: data.weights || [],
                shapes: data.shapes || [],
                weightVariants: data.weightVariants || data.weightOptions || [],
                weightOptions: data.weightOptions || data.weightVariants || [],
                availableShapes: data.availableShapes || data.shapes || [],
                isEggless: true,
              });
            });

            const firestoreIds = new Set(firestoreProducts.map((p) => p.id));
            const localStored = getStoredProducts();

            // Merge Firestore products with any remaining default products
            const merged = [
              ...firestoreProducts,
              ...localStored.filter((p) => !firestoreIds.has(p.id)),
            ];

            setProducts(merged);
            saveProducts(merged);
          }
        },
        (err) => {
          console.warn("Firestore products snapshot notice:", err);
        }
      );
    } catch (e) {
      console.warn("Could not subscribe to Firestore products:", e);
    }

    return () => {
      window.removeEventListener("products-updated", handleUpdate);
      unsubscribe();
    };
  }, []);

  const addProduct = async (newProduct: Omit<Product, "id"> & { id?: string }) => {
    const id = newProduct.id || `product-${Date.now()}`;
    const img = newProduct.image || (newProduct as any).imageUrl || (newProduct as any).photoUrl || (newProduct as any).bannerUrl || "";
    const productToAdd: Product = {
      ...newProduct,
      id,
      image: img,
      imageUrl: img,
      photoUrl: img,
      bannerUrl: img,
      isEggless: true,
    };
    const current = getStoredProducts();
    const updated = [productToAdd, ...current];
    saveProducts(updated);

    try {
      await setDoc(doc(db, "products", id), productToAdd, { merge: true });
    } catch (err) {
      console.warn("Firestore addProduct error:", err);
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const current = getStoredProducts();
    const img = updatedFields.image || (updatedFields as any).imageUrl || (updatedFields as any).photoUrl || (updatedFields as any).bannerUrl;
    const fieldsToSave = {
      ...updatedFields,
      ...(img ? { image: img, imageUrl: img, photoUrl: img, bannerUrl: img } : {}),
    };
    const updated = current.map((p) => (p.id === id ? { ...p, ...fieldsToSave } : p));
    saveProducts(updated);

    try {
      await setDoc(doc(db, "products", id), fieldsToSave, { merge: true });
    } catch (err) {
      console.warn("Firestore updateProduct error:", err);
    }
  };

  const deleteProduct = async (id: string) => {
    const current = getStoredProducts();
    const updated = current.filter((p) => p.id !== id);
    saveProducts(updated);

    try {
      await deleteDoc(doc(db, "products", id));
    } catch (err) {
      console.warn("Firestore deleteProduct error:", err);
    }
  };

  const resetToDefault = () => {
    saveProducts(initialProducts);
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
  };
}
