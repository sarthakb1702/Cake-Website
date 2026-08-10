"use client";

import { useState, useEffect } from "react";
import { gallery as DEFAULT_GALLERY } from "@/lib/site-data";

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
}

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = DEFAULT_GALLERY.map((url, i) => ({
  id: `gal-${i + 1}`,
  url,
  caption: `Fresh bake showcase photo #${i + 1}`,
}));

const STORAGE_KEY = "shreyas_bakery_gallery_data";

export function getStoredGallery(): GalleryItem[] {
  if (typeof window === "undefined") return INITIAL_GALLERY_ITEMS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error loading gallery:", e);
  }
  return INITIAL_GALLERY_ITEMS;
}

export function saveGallery(data: GalleryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("gallery-data-updated"));
  } catch (e) {
    console.error("Error saving gallery:", e);
  }
}

export function useGalleryStore() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);

  useEffect(() => {
    setGalleryItems(getStoredGallery());
    const handleUpdate = () => setGalleryItems(getStoredGallery());
    window.addEventListener("gallery-data-updated", handleUpdate);
    return () => window.removeEventListener("gallery-data-updated", handleUpdate);
  }, []);

  const addGalleryItem = (item: Omit<GalleryItem, "id">) => {
    const current = getStoredGallery();
    const newItem: GalleryItem = { ...item, id: `gal-${Date.now()}` };
    const updated = [newItem, ...current];
    saveGallery(updated);
  };

  const updateGalleryItem = (id: string, updatedFields: Partial<GalleryItem>) => {
    const current = getStoredGallery();
    const updated = current.map((g) => (g.id === id ? { ...g, ...updatedFields } : g));
    saveGallery(updated);
  };

  const deleteGalleryItem = (id: string) => {
    const current = getStoredGallery();
    const updated = current.filter((g) => g.id !== id);
    saveGallery(updated);
  };

  return { galleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem };
}
