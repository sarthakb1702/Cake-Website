"use client";

import { useState, useEffect } from "react";

export interface ReviewItem {
  id: string;
  name: string;
  quote: string;
  rating: number;
  approved: boolean;
}

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Ananya Sharma",
    quote: "The Belgian chocolate truffle cake for my daughter's birthday was unbelievably light, rich, and 100% eggless. Everyone asked where we ordered it!",
    rating: 5,
    approved: true,
  },
  {
    id: "rev-2",
    name: "Rahul Verma",
    quote: "Hands down the best bakery in town. The custom order process was super smooth and the cake looked even better than the reference photo.",
    rating: 5,
    approved: true,
  },
  {
    id: "rev-3",
    name: "Priya Patel",
    quote: "Freshly baked, zero artificial flavor aftertaste, and prompt express delivery. Shreya's Home Bakery is our go-to for all family celebrations.",
    rating: 5,
    approved: true,
  },
  {
    id: "rev-4",
    name: "Rohan Mehta",
    quote: "The red velvet jar cakes and fudge donuts were a massive hit at our office party! Moist, rich, and perfectly sweet.",
    rating: 5,
    approved: true,
  },
];

const STORAGE_KEY = "shreyas_bakery_reviews_data";

export function getStoredReviews(): ReviewItem[] {
  if (typeof window === "undefined") return INITIAL_REVIEWS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error loading reviews:", e);
  }
  return INITIAL_REVIEWS;
}

export function saveReviews(data: ReviewItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("reviews-data-updated"));
  } catch (e) {
    console.error("Error saving reviews:", e);
  }
}

export function useReviewsStore() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);

  useEffect(() => {
    setReviews(getStoredReviews());
    const handleUpdate = () => setReviews(getStoredReviews());
    window.addEventListener("reviews-data-updated", handleUpdate);
    return () => window.removeEventListener("reviews-data-updated", handleUpdate);
  }, []);

  const addReview = (review: Omit<ReviewItem, "id">) => {
    const current = getStoredReviews();
    const newRev: ReviewItem = { ...review, id: `rev-${Date.now()}` };
    const updated = [newRev, ...current];
    saveReviews(updated);
  };

  const updateReview = (id: string, updatedFields: Partial<ReviewItem>) => {
    const current = getStoredReviews();
    const updated = current.map((r) => (r.id === id ? { ...r, ...updatedFields } : r));
    saveReviews(updated);
  };

  const deleteReview = (id: string) => {
    const current = getStoredReviews();
    const updated = current.filter((r) => r.id !== id);
    saveReviews(updated);
  };

  return { reviews, addReview, updateReview, deleteReview };
}
