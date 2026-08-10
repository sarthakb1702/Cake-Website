"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface HeroSlide {
  id: string;
  name: string; // Badge title e.g. "Belgian Chocolate Truffle"
  note: string; // Sub-description
  price: string; // Price tag e.g. "₹950"
  image: string; // Slide image URL
  imageUrl?: string; // Database key alias
  photoUrl?: string; // Database key alias
  slideImagePhoto?: string; // Database key alias
  bannerUrl?: string; // Database key alias
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
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80",
    photoUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80",
    slideImagePhoto: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Life's too short to eat boring cake",
    subDescription: "Small-batch 100% eggless cakes baked at dawn, finished by hand, and delivered to your door. No shortcuts, no dry sponge, ever.",
  },
  {
    id: "hero-2",
    name: "Red Velvet Cream Cheese",
    note: "Classic crimson velvet sponge layers paired with rich cream cheese frosting.",
    price: "₹1,050",
    image: "https://images.unsplash.com/photo-1586788680404-32824795b6b3?auto=format&fit=crop&w=1100&q=80",
    imageUrl: "https://images.unsplash.com/photo-1586788680404-32824795b6b3?auto=format&fit=crop&w=1100&q=80",
    photoUrl: "https://images.unsplash.com/photo-1586788680404-32824795b6b3?auto=format&fit=crop&w=1100&q=80",
    slideImagePhoto: "https://images.unsplash.com/photo-1586788680404-32824795b6b3?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Handcrafted crimson velvet perfection",
    subDescription: "Baked fresh with pure cream cheese frosting and organic vanilla bean extract.",
  },
  {
    id: "hero-3",
    name: "Chocolate Glazed Donuts",
    note: "Soft, fluffy eggless donuts dipped in Belgian milk chocolate glaze.",
    price: "₹420",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1100&q=80",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1100&q=80",
    photoUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1100&q=80",
    slideImagePhoto: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Soft, pillowy & chocolate coated bliss",
    subDescription: "Signature 100% eggless artisan donuts glazed in dark and milk chocolate.",
  },
  {
    id: "hero-4",
    name: "Roasted Walnut Dark Fudge",
    note: "Dense, slow-cooked dark chocolate fudge packed with slow-roasted walnuts.",
    price: "₹580",
    image: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=1100&q=80",
    imageUrl: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=1100&q=80",
    photoUrl: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=1100&q=80",
    slideImagePhoto: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=1100&q=80",
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
  const [slides, setSlides] = useState<HeroSlide[]>(getStoredHeroSlides());

  useEffect(() => {
    setSlides(getStoredHeroSlides());
    const handleUpdate = () => setSlides(getStoredHeroSlides());
    window.addEventListener("hero-slides-updated", handleUpdate);

    // Real-Time Firestore Sync Listener for Hero section
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, "settings", "hero");
      unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.slides) && data.slides.length > 0) {
              // Ensure every slide maps all image schema keys
              const mappedSlides: HeroSlide[] = data.slides.map((s: any) => {
                const img = s.imageUrl || s.photoUrl || s.slideImagePhoto || s.image || s.bannerUrl || "";
                return {
                  ...s,
                  image: img,
                  imageUrl: img,
                  photoUrl: img,
                  slideImagePhoto: img,
                  bannerUrl: img,
                };
              });
              setSlides(mappedSlides);
              saveHeroSlides(mappedSlides);
            }
          }
        },
        (err) => {
          console.warn("Firestore hero listener notice:", err);
        }
      );
    } catch (e) {
      console.warn("Could not subscribe to Firestore hero slides:", e);
    }

    return () => {
      window.removeEventListener("hero-slides-updated", handleUpdate);
      unsubscribe();
    };
  }, []);

  const syncToFirestore = async (newSlides: HeroSlide[]) => {
    try {
      const docRef = doc(db, "settings", "hero");
      await setDoc(docRef, { slides: newSlides, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn("Error saving hero slides to Firestore:", e);
    }
  };

  const updateSlide = (id: string, updatedFields: Partial<HeroSlide>) => {
    const current = getStoredHeroSlides();
    const updated = current.map((s) => {
      if (s.id === id) {
        const img =
          updatedFields.imageUrl ||
          updatedFields.photoUrl ||
          updatedFields.slideImagePhoto ||
          updatedFields.image ||
          updatedFields.bannerUrl ||
          s.imageUrl ||
          s.photoUrl ||
          s.slideImagePhoto ||
          s.image;
        return {
          ...s,
          ...updatedFields,
          image: img,
          imageUrl: img,
          photoUrl: img,
          slideImagePhoto: img,
          bannerUrl: img,
        };
      }
      return s;
    });

    saveHeroSlides(updated);
    syncToFirestore(updated);
  };

  const resetHero = () => {
    saveHeroSlides(INITIAL_HERO_SLIDES);
    syncToFirestore(INITIAL_HERO_SLIDES);
  };

  return {
    slides,
    updateSlide,
    resetHero,
  };
}
