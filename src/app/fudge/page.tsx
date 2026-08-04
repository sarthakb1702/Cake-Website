import React from "react";
import { FudgeCard } from "../../components/FudgeCard";
import { PRODUCTS } from "../../data/products";

export default function FudgePage() {
  const fudges = PRODUCTS.filter((p) => p.category === "fudge");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Fudge</p>
        <h1 className="text-3xl font-extrabold text-stone-900">Rich, Dense Fudge Boxes</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {fudges.length === 0 ? (
          <p className="text-sm text-gray-500">No fudge available at the moment.</p>
        ) : (
          fudges.map((product) => (
            <FudgeCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              description={product.description}
              pricePer250g={product.weightOptions?.[0]?.price ?? 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
