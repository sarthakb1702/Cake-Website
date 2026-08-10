"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { WheatOff, Milk, Nut, Sparkles } from "lucide-react";
import { SectionLabel, FloatingSparkle } from "./decor";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useBakeOfTheMonthStore } from "@/lib/bake-of-month-store";
import { AdminEditButton } from "@/components/AdminEditButton";
import { BakeOfTheMonthEditModal } from "./BakeOfTheMonthEditModal";

const badgeIcons = [WheatOff, Milk, Nut, Sparkles];

export function Spotlight() {
  const pathname = usePathname();
  const { addToCart } = useCart();
  const { userRole } = useAuth();
  const { bakeOfMonth } = useBakeOfTheMonthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const hideEcommerce = userRole === "admin" || pathname?.startsWith("/admin");
  const price = bakeOfMonth.price || 500;

  const displayHighlights =
    bakeOfMonth.highlights && bakeOfMonth.highlights.length > 0
      ? bakeOfMonth.highlights
      : [
          "100% Eggless recipe",
          "Rich Belgian chocolate",
          "Freshly roasted nuts",
          "Zero artificial preservatives",
        ];

  return (
    <section className="grain relative overflow-hidden bg-chocolate py-20 md:py-28">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:px-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[3rem] bg-blush/20" />
          <img
            src={
              bakeOfMonth.image ||
              "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80"
            }
            alt={bakeOfMonth.title}
            loading="lazy"
            className="relative aspect-[5/4] w-full rounded-[2.5rem] object-cover shadow-lift"
          />
          <FloatingSparkle className="-top-4 -right-2 text-butter" size="h-8 w-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <SectionLabel>{bakeOfMonth.badgeText || "BAKE OF THE MONTH"}</SectionLabel>

          <h2 className="mt-6 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[0.95] font-black text-cream-white uppercase">
            {bakeOfMonth.title}
          </h2>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream-white/70">
            {bakeOfMonth.description}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
            {displayHighlights.map((label, idx) => {
              const IconComp = badgeIcons[idx % badgeIcons.length];
              return (
                <div
                  key={label + idx}
                  className="flex items-center gap-2.5 rounded-2xl border border-cream-white/12 px-4 py-3"
                >
                  <IconComp className="h-4 w-4 shrink-0 text-blush" />
                  <span className="text-[11px] font-medium text-cream-white/80">{label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-9 flex items-center gap-5">
            {!hideEcommerce ? (
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    id: bakeOfMonth.catalogProductId || bakeOfMonth.id,
                    name: bakeOfMonth.title,
                    price: Number(price),
                    image: bakeOfMonth.image,
                    category: "cake",
                  })
                }
                className="rounded-full bg-[#E86A7A] px-8 py-4 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-[#d65767] cursor-pointer shadow-badge"
              >
                Add to Cart
              </button>
            ) : (
              <AdminEditButton
                onClick={() => setIsEditModalOpen(true)}
                label="Edit Bake of the Month"
                className="px-8 py-4 text-sm font-semibold"
              />
            )}
            <span className="font-display text-2xl font-black text-cream-white">₹{price}</span>
          </div>
        </motion.div>
      </div>

      <BakeOfTheMonthEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </section>
  );
}
