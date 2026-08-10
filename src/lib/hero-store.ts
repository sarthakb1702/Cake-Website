"use client";

import { useState, useEffect } from "react";

export interface HeroSlide {
  id: string;
  name: string; // Badge title e.g. "Belgian Chocolate Truffle"
  note: string; // Sub-description
  price: string; // Price tag e.g. "₹950"
  image: string; // Slide image URL
  mainTitle?: string; // Main title e.g. "Life's too short to eat boring cake"
  subDescription?: string; // Hero section sub-description text
}

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-1",
    name: "Belgian Chocolate Truffle",
    note: "Rich, smooth 100% eggless Belgian chocolate layered with dark cocoa sponge.",
    price: "₹950",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Life's too short to eat boring cake",
    subDescription: "Small-batch 100% eggless cakes baked at dawn, finished by hand, and delivered to your door. No shortcuts, no dry sponge, ever.",
  },
  {
    id: "hero-2",
    name: "Red Velvet Cream Cheese",
    note: "Classic crimson velvet sponge layers paired with rich cream cheese frosting.",
    price: "₹1,050",
    image: "https://images.unsplash.com/photo-1586788680404-32824795b6b3?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Handcrafted crimson velvet perfection",
    subDescription: "Baked fresh with pure cream cheese frosting and organic vanilla bean extract.",
  },
  {
    id: "hero-3",
    name: "Chocolate Glazed Donuts",
    note: "Soft, fluffy eggless donuts dipped in Belgian milk chocolate glaze.",
    price: "₹420",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Soft, pillowy & chocolate coated bliss",
    subDescription: "Signature 100% eggless artisan donuts glazed in dark and milk chocolate.",
  },
  {
    id: "hero-4",
    name: "Roasted Walnut Dark Fudge",
    note: "Dense, slow-cooked dark chocolate fudge packed with slow-roasted walnuts.",
    price: "₹580",
    image: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Slow cooked rich dark chocolate fudge",
    subDescription: "Kettle cooked in small batches using single origin 70% dark cocoa.",
  },
];

const STORAGE_KEY = "shreyas_bakery_hero_slides";

export function getStoredHeroSlides(): HeroSlide[] {
  if (typeof window === "undefined") return INITIAL_HERO_SLIDES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading hero slides:", e);
  }
  return INITIAL_HERO_SLIDES;
}

export function saveHeroSlides(slides: HeroSlide[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    window.dispatchEvent(new Event("hero-slides-updated"));
  } catch (e) {
    console.error("Error saving hero slides:", e);
  }
}

export function useHeroStore() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    setSlides(getStoredHeroSlides());
    const handleUpdate = () => setSlides(getStoredHeroSlides());
    window.addEventListener("hero-slides-updated", handleUpdate);
    return () => window.removeEventListener("hero-slides-updated", handleUpdate);
  }, []);

  const updateSlide = (id: string, updatedFields: Partial<HeroSlide>) => {
    const current = getStoredHeroSlides();
    const updated = current.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
    saveHeroSlides(updated);
  };

  const resetHero = () => {
    saveHeroSlides(INITIAL_HERO_SLIDES);
  };

  return {
    slides,
    updateSlide,
    resetHero,
  };
}
