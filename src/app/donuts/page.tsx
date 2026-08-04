import React from "react";
import { DonutCard } from "../../components/DonutCard";
import { PRODUCTS } from "../../data/products";

export default function DonutsPage() {
  const donuts = PRODUCTS.filter((p) => p.category === "donut");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Donuts</p>
        <h1 className="text-3xl font-extrabold text-stone-900">Freshly Baked Donuts</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {donuts.length === 0 ? (
          <p className="text-sm text-gray-500">No donuts available at the moment.</p>
        ) : (
          donuts.map((product) => (
            <DonutCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              description={product.description}
              basePricePerPiece={product.pricePerPiece ?? 80}
            />
          ))
        )}
      </div>
    </div>
  );
}
