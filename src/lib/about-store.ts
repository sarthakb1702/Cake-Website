"use client";

import { useState, useEffect } from "react";

export interface AboutData {
  title: string;
  storyLine1: string;
  storyLine2: string;
  photo1: string;
  photo2: string;
  foundedYear: string;
  cakesServed: string;
}

export const INITIAL_ABOUT_DATA: AboutData = {
  title: "Two ovens, one stubborn standard",
  storyLine1:
    "Shreya's Home Bakery started with two ovens, pure butter, 100% eggless recipes, and a refusal to use anything artificial.",
  storyLine2:
    "Our fruit is hand-picked fresh, our chocolate is authentic Belgian cacao, and every single order is crafted with love.",
  photo1: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=800&q=80",
  photo2: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=800&q=80",
  foundedYear: "2018",
  cakesServed: "500+",
};

const STORAGE_KEY = "shreyas_bakery_about_data";

export function getStoredAboutData(): AboutData {
  if (typeof window === "undefined") return INITIAL_ABOUT_DATA;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error loading About data:", e);
  }
  return INITIAL_ABOUT_DATA;
}

export function saveAboutData(data: AboutData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("about-data-updated"));
  } catch (e) {
    console.error("Error saving About data:", e);
  }
}

export function useAboutStore() {
  const [aboutData, setAboutData] = useState<AboutData>(INITIAL_ABOUT_DATA);

  useEffect(() => {
    setAboutData(getStoredAboutData());
    const handleUpdate = () => setAboutData(getStoredAboutData());
    window.addEventListener("about-data-updated", handleUpdate);
    return () => window.removeEventListener("about-data-updated", handleUpdate);
  }, []);

  const updateAbout = (updatedFields: Partial<AboutData>) => {
    const current = getStoredAboutData();
    const updated = { ...current, ...updatedFields };
    saveAboutData(updated);
  };

  return { aboutData, updateAbout };
}
