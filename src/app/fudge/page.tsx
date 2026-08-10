"use client";

import React from "react";
import { useProductsStore } from "@/lib/products-store";
import { FudgeCard } from "@/components/FudgeCard";

export default function FudgePage() {
  const { products } = useProductsStore();

  const fudges = products.filter((p) => p.category?.toLowerCase() === "fudge");

  return (
    <div className="min-h-screen bg-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="inline-block rounded-full bg-secondary px-3.5 py-1 text-[11px] font-bold tracking-wider text-chocolate uppercase">
            Artisan Confections
          </span>
          <h1 className="font-display text-4xl font-black uppercase text-chocolate mt-2">Slow-Cooked Dark Fudge</h1>
          <p className="text-xs text-muted-foreground mt-1">Dense, velvety dark chocolate fudge cooked slowly in copper kettles.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fudges.map((product) => {
            const price =
              product.price ||
              product.weightVariants?.[0]?.price ||
              product.weightOptions?.[0]?.price ||
              300;
            return (
              <FudgeCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image}
                description={product.description}
                price={price}
                pricePer250g={price}
                weightVariants={product.weightVariants}
                weightOptions={product.weightOptions}
                weights={product.weights}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
