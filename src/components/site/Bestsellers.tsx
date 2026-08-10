"use client";

import React from "react";
import { motion } from "motion/react";
import { SectionLabel, revealUp, staggerParent } from "./decor";
import { useBestsellersStore } from "@/lib/bestsellers-store";
import { useAuth } from "@/context/AuthContext";
import { AdminEditButton } from "@/components/AdminEditButton";
import { ProductCard } from "@/components/ProductCard";

export function Bestsellers() {
  const { userRole } = useAuth();
  const { bestsellerProducts } = useBestsellersStore();

  return (
    <section id="shop" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <SectionLabel>Our Bestsellers</SectionLabel>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="mt-5 font-display text-[clamp(2.2rem,4.6vw,3.9rem)] leading-[0.95] font-black uppercase text-chocolate">
              Four bakes
              <br />
              people fight over
            </h2>
            {userRole === "admin" && (
              <AdminEditButton href="/admin/bestsellers" label="Manage Bestsellers" className="mt-4" />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 max-w-xs">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Baked fresh daily, 100% eggless with single-origin cocoa. Select your custom weight and shape options directly on each product card!
          </p>
        </div>
      </div>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {bestsellerProducts.map((product) => (
          <motion.div key={product.id} variants={revealUp}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
