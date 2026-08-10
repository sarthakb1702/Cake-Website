"use client";

import { useState, useEffect } from "react";
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
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getStoredProducts());

    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };

    window.addEventListener("products-updated", handleUpdate);
    return () => window.removeEventListener("products-updated", handleUpdate);
  }, []);

  const addProduct = (newProduct: Omit<Product, "id"> & { id?: string }) => {
    const id = newProduct.id || `product-${Date.now()}`;
    const productToAdd: Product = {
      ...newProduct,
      id,
      isEggless: true,
    };
    const current = getStoredProducts();
    const updated = [productToAdd, ...current];
    saveProducts(updated);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const current = getStoredProducts();
    const updated = current.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const current = getStoredProducts();
    const updated = current.filter((p) => p.id !== id);
    saveProducts(updated);
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
