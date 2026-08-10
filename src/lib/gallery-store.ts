"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(getStoredGallery());

  useEffect(() => {
    setGalleryItems(getStoredGallery());
    const handleUpdate = () => setGalleryItems(getStoredGallery());
    window.addEventListener("gallery-data-updated", handleUpdate);

    // Real-Time Firestore Sync Listener for Gallery
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, "settings", "gallery");
      unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.items) && data.items.length > 0) {
              setGalleryItems(data.items);
              saveGallery(data.items);
            }
          }
        },
        (err) => {
          console.warn("Firestore gallery listener notice:", err);
        }
      );
    } catch (e) {
      console.warn("Could not subscribe to Firestore gallery:", e);
    }

    return () => {
      window.removeEventListener("gallery-data-updated", handleUpdate);
      unsubscribe();
    };
  }, []);

  const syncToFirestore = async (items: GalleryItem[]) => {
    try {
      const docRef = doc(db, "settings", "gallery");
      await setDoc(docRef, { items, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn("Error saving gallery to Firestore:", e);
    }
  };

  const addGalleryItem = (item: Omit<GalleryItem, "id">) => {
    const current = getStoredGallery();
    const newItem: GalleryItem = { ...item, id: `gal-${Date.now()}` };
    const updated = [newItem, ...current];
    saveGallery(updated);
    syncToFirestore(updated);
  };

  const updateGalleryItem = (id: string, updatedFields: Partial<GalleryItem>) => {
    const current = getStoredGallery();
    const updated = current.map((g) => (g.id === id ? { ...g, ...updatedFields } : g));
    saveGallery(updated);
    syncToFirestore(updated);
  };

  const deleteGalleryItem = (id: string) => {
    const current = getStoredGallery();
    const updated = current.filter((g) => g.id !== id);
    saveGallery(updated);
    syncToFirestore(updated);
  };

  return { galleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem };
}
