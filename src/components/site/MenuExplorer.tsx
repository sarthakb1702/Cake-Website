"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { SectionLabel } from "./decor";
import { useProductsStore } from "@/lib/products-store";
import { ProductCard } from "@/components/ProductCard";

export function MenuExplorer() {
  const [active, setActive] = useState<string>("All");
  const { products } = useProductsStore();

  const customCategories = Array.from(
    new Set(
      products
        .map((p: any) => p.category)
        .filter((c: any) => Boolean(c) && !["cake", "donut", "fudge"].includes(String(c).toLowerCase()))
    )
  ).map((c: any) => String(c).charAt(0).toUpperCase() + String(c).slice(1));

  const menuTabs = ["All", "Cakes", "Donuts", "Fudge", ...customCategories];

  const filteredProducts = products.filter((item: any) => {
    if (active === "All") return true;
    if (active === "Cakes") return item.category?.toLowerCase() === "cake" || item.category?.toLowerCase() === "cakes";
    if (active === "Donuts") return item.category?.toLowerCase() === "donut" || item.category?.toLowerCase() === "donuts";
    if (active === "Fudge") return item.category?.toLowerCase() === "fudge";
    return item.category?.toLowerCase() === active.toLowerCase();
  });

  return (
    <section id="flavours" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div>
          <SectionLabel>Flavour explorer</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,4.6vw,3.9rem)] leading-[0.95] font-black uppercase text-chocolate">
            Pick your
            <br />
            sugar lane
          </h2>
        </div>
        <div className="no-scrollbar -mx-5 flex w-full gap-2 overflow-x-auto px-5 md:mx-0 md:w-auto md:px-0">
          {menuTabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={
                t === active
                  ? "shrink-0 rounded-full bg-chocolate px-6 py-3 text-sm font-semibold text-cream-white cursor-pointer"
                  : "shrink-0 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-chocolate transition-colors hover:border-rose hover:text-rose cursor-pointer"
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar -mx-5 mt-12 flex snap-x gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {filteredProducts.map((item, i) => (
          <motion.div
            key={`${active}-${item.id}`}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] md:w-auto"
          >
            <ProductCard product={item} />
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 rounded-full border-2 border-chocolate px-8 py-3.5 text-sm font-semibold text-chocolate transition-all hover:bg-chocolate hover:text-cream-white"
        >
          Explore Full Bakery Catalog &rarr;
        </Link>
      </div>
    </section>
  );
}
