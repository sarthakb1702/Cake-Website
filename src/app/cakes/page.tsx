import React from "react";
import { CakeCard } from "../../components/CakeCard";
import { PRODUCTS } from "../../data/products";

export default function CakesPage() {
  const cakes = PRODUCTS.filter((p) => p.category === "cake");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Cakes</p>
        <h1 className="text-3xl font-extrabold text-stone-900">Signature Eggless Cakes</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cakes.length === 0 ? (
          <p className="text-sm text-gray-500">No cakes available at the moment.</p>
        ) : (
          cakes.map((product) => (
            <CakeCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              description={product.description}
              basePrice={product.weightOptions?.[0]?.price ?? 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
