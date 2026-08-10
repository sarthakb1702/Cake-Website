"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight, Truck } from "lucide-react";
import { FloatingSparkle } from "./decor";
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
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80",
    photoUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80",
    slideImagePhoto: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80",
    mainTitle: "Life's too short to eat boring cake",
    subDescription: "Small-batch 100% eggless cakes baked at dawn, finished by hand, and delivered to your door.",
  };

  const activeImage =
    slide.imageUrl ||
    slide.photoUrl ||
    slide.slideImagePhoto ||
    slide.image ||
    slide.bannerUrl ||
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1100&q=80";

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -60]);

  const isAdmin = userRole === "admin";

  return (
    <section id="top" className="grain relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-20 md:pt-14 md:pb-24">
      {isAdmin && (
        <div className="absolute top-4 right-4 sm:right-6 z-40">
          <AdminEditButton
            onClick={() => setIsEditModalOpen(true)}
            label={`Edit Slide ${index + 1} of ${heroSlides.length}`}
          />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid items-center gap-10 lg:gap-14 lg:grid-cols-[1.05fr_1fr]">
        {/* Left Column: Text & CTAs */}
        <div className="relative z-10 text-left">
          <FloatingSparkle className="-top-6 left-1 text-rose hidden sm:block" delay={0.4} />
          
          <motion.h1
            key={slide.id + "-title"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] sm:leading-[0.94] font-black uppercase text-chocolate tracking-tight"
          >
            {slide.mainTitle || "Life's too short to eat boring cake"}
          </motion.h1>

          <motion.p
            key={slide.id + "-sub"}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-4 sm:mt-7 flex max-w-md items-start gap-3 text-xs sm:text-sm lg:text-[15px] leading-relaxed text-muted-foreground"
          >
            <span className="mt-0.5 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-chocolate">
              <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            {slide.subDescription || "Small-batch 100% eggless cakes baked at dawn, finished by hand, and delivered to your door. No shortcuts, no dry sponge, ever."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 sm:mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/catalog"
              className="w-full sm:w-auto text-center rounded-full bg-[#E86A7A] px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-white shadow-badge transition-all hover:scale-105 hover:bg-[#d65767]"
            >
              Order Now
            </Link>
            <Link
              href="/catalog"
              className="w-full sm:w-auto text-center rounded-full border-2 border-chocolate px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-chocolate transition-all hover:scale-105 hover:bg-chocolate hover:text-cream-white"
            >
              Explore Menu
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="relative w-full max-w-md lg:max-w-none mx-auto">
          <div className="absolute inset-x-0 top-0 bottom-12 sm:bottom-16 rounded-t-full bg-blush" />
          <FloatingSparkle className="top-10 right-6 text-chocolate hidden sm:block" delay={1.1} size="h-7 w-7" />
          <FloatingSparkle className="bottom-24 left-2 text-rose hidden sm:block" delay={0.2} />

          <motion.img
            key={activeImage}
            style={{ y }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={activeImage}
            alt={`${slide.name} artisan bake by Shreya's Home Bakery`}
            loading="eager"
            className="relative z-10 mx-auto aspect-[4/5] w-[82%] sm:w-[76%] rounded-[2rem] sm:rounded-[3rem] object-cover shadow-lift"
          />

          {/* Floating Product Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative sm:absolute sm:right-0 sm:bottom-12 z-20 mt-4 sm:mt-0 w-full sm:w-[15rem] rounded-3xl bg-card p-4 sm:p-5 shadow-lift md:-right-2 border border-border"
          >
            <p className="font-display text-lg sm:text-xl font-bold text-chocolate">{slide.name}</p>
            <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-muted-foreground">{slide.note}</p>
            {isAdmin && (
              <div className="mt-3">
                <AdminEditButton
                  onClick={() => setIsEditModalOpen(true)}
                  label="Edit This Slide"
                  className="w-full text-[11px] py-1.5"
                />
              </div>
            )}
            <div className="absolute -top-5 -right-3 sm:-top-7 sm:-right-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#E86A7A] font-display text-xs sm:text-sm font-black text-white shadow-badge">
              {slide.price}
            </div>
          </motion.div>

          {/* Carousel Controls */}
          <div className="relative z-20 mt-6 flex items-center justify-center gap-4">
            <button
              aria-label="Previous cake"
              onClick={() => setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border bg-card transition-transform hover:scale-110 text-chocolate cursor-pointer shadow-soft"
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
                      ? "h-2 w-6 sm:w-7 rounded-full bg-[#E86A7A] transition-all cursor-pointer"
                      : "h-2 w-2 rounded-full bg-border transition-all cursor-pointer"
                  }
                />
              ))}
            </div>
            <button
              aria-label="Next cake"
              onClick={() => setIndex((i) => (i + 1) % heroSlides.length)}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border bg-card transition-transform hover:scale-110 text-chocolate cursor-pointer shadow-soft"
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
