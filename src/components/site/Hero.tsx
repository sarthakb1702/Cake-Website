"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight, Truck } from "lucide-react";
import { FloatingSparkle, Sparkle } from "./decor";
import { useHeroStore } from "@/lib/hero-store";
import { useAuth } from "@/context/AuthContext";
import { AdminEditButton } from "@/components/AdminEditButton";
import { HeroEditModal } from "./HeroEditModal";

export function Hero() {
  const [index, setIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { slides } = useHeroStore();
  const { userRole } = useAuth();

  const heroSlides = slides.length > 0 ? slides : [];
  const slide = heroSlides[index] || {
    id: "hero-1",
    name: "Belgian Chocolate Truffle",
    note: "Rich, smooth 100% eggless Belgian chocolate layered with dark cocoa sponge.",
    price: "₹950",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Life's too short to eat boring cake",
    subDescription: "Small-batch 100% eggless cakes baked at dawn, finished by hand, and delivered to your door.",
  };

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -60]);

  const isAdmin = userRole === "admin";

  return (
    <section id="top" className="grain relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {isAdmin && (
        <div className="absolute top-4 right-6 z-40">
          <AdminEditButton
            onClick={() => setIsEditModalOpen(true)}
            label={`Edit Slide ${index + 1} of ${heroSlides.length}`}
          />
        </div>
      )}

      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:px-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative">
          <FloatingSparkle className="-top-6 left-1 text-rose" delay={0.4} />
          
          <motion.h1
            key={slide.id + "-title"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-[clamp(2.9rem,7.4vw,5.9rem)] leading-[0.92] font-black uppercase text-chocolate"
          >
            {slide.mainTitle || "Life's too short to eat boring cake"}
          </motion.h1>

          <motion.p
            key={slide.id + "-sub"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 flex max-w-md items-start gap-3 text-[15px] leading-relaxed text-muted-foreground"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-chocolate">
              <Truck className="h-4 w-4" />
            </span>
            {slide.subDescription || "Small-batch 100% eggless cakes baked at dawn, finished by hand, and delivered to your door. No shortcuts, no dry sponge, ever."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/catalog"
              className="rounded-full bg-[#E86A7A] px-8 py-4 text-sm font-semibold text-white shadow-badge transition-all hover:scale-105 hover:bg-[#d65767]"
            >
              Order Now
            </Link>
            <Link
              href="/catalog"
              className="rounded-full border-2 border-chocolate px-8 py-4 text-sm font-semibold text-chocolate transition-all hover:scale-105 hover:bg-chocolate hover:text-cream-white"
            >
              Explore Menu
            </Link>
          </motion.div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-0 top-0 bottom-16 rounded-t-full bg-blush" />
          <FloatingSparkle className="top-10 right-6 text-chocolate" delay={1.1} size="h-7 w-7" />
          <FloatingSparkle className="bottom-24 left-2 text-rose" delay={0.2} />

          <motion.img
            key={slide.image}
            style={{ y }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            src={slide.image}
            alt={`${slide.name} artisan bake by Shreya's Home Bakery`}
            loading="eager"
            className="relative z-10 mx-auto aspect-[4/5] w-[76%] rounded-[3rem] object-cover shadow-lift"
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute right-0 bottom-16 z-20 w-[15rem] rounded-3xl bg-card p-5 shadow-lift md:-right-2"
          >
            <p className="font-display text-xl font-bold text-chocolate">{slide.name}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{slide.note}</p>
            {isAdmin && (
              <div className="mt-3">
                <AdminEditButton
                  onClick={() => setIsEditModalOpen(true)}
                  label="Edit This Slide"
                  className="w-full text-[11px] py-1.5"
                />
              </div>
            )}
            <div className="absolute -top-7 -right-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E86A7A] font-display text-sm font-black text-white shadow-badge">
              {slide.price}
            </div>
          </motion.div>

          <div className="relative z-20 mt-6 flex items-center justify-center gap-4">
            <button
              aria-label="Previous cake"
              onClick={() => setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-transform hover:scale-110 text-chocolate cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {heroSlides.map((s, i) => (
                <button
                  key={s.id || s.name}
                  aria-label={s.name}
                  onClick={() => setIndex(i)}
                  className={
                    i === index
                      ? "h-2 w-7 rounded-full bg-[#E86A7A] transition-all cursor-pointer"
                      : "h-2 w-2 rounded-full bg-border transition-all cursor-pointer"
                  }
                />
              ))}
            </div>
            <button
              aria-label="Next cake"
              onClick={() => setIndex((i) => (i + 1) % heroSlides.length)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-transform hover:scale-110 text-chocolate cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <HeroEditModal
        slide={slide}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </section>
  );
}
