"use client";

import React from "react";
import { useProductsStore } from "@/lib/products-store";
import { CakeCard } from "@/components/CakeCard";

export default function CakesPage() {
  const { products } = useProductsStore();

  const cakes = products.filter((p) => p.category?.toLowerCase() === "cake" || p.category?.toLowerCase() === "cakes");

  return (
    <div className="min-h-screen bg-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="inline-block rounded-full bg-secondary px-3.5 py-1 text-[11px] font-bold tracking-wider text-chocolate uppercase">
            Artisan Bakes
          </span>
          <h1 className="font-display text-4xl font-black uppercase text-chocolate mt-2">Signature Eggless Cakes</h1>
          <p className="text-xs text-muted-foreground mt-1">Baked fresh at dawn, layered with premium Belgian cocoa and cream.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cakes.map((product) => {
            const basePrice =
              product.price ||
              product.weightVariants?.[0]?.price ||
              product.weightOptions?.[0]?.price ||
              500;
            return (
              <CakeCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image}
                description={product.description}
                basePrice={basePrice}
                weights={product.weights}
                shapes={product.shapes || product.availableShapes}
                weightVariants={product.weightVariants}
                weightOptions={product.weightOptions}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
