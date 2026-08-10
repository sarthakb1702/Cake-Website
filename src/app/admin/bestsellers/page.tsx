"use client";

import { useState } from "react";
import Link from "next/link";
import { useBestsellersStore } from "@/lib/bestsellers-store";
import { useProductsStore } from "@/lib/products-store";
import {
  Sparkles,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  CheckCircle2,
  Shield,
  Star,
} from "lucide-react";

export default function AdminBestsellersPage() {
  const { products } = useProductsStore();
  const {
    bestsellerIds,
    bestsellerProducts,
    addBestseller,
    removeBestseller,
    moveBestseller,
  } = useBestsellersStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdd = (id: string, name: string) => {
    addBestseller(id);
    showToast(`Added "${name}" to Bestsellers!`);
  };

  const handleRemove = (id: string, name: string) => {
    removeBestseller(id);
    showToast(`Removed "${name}" from Bestsellers.`);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    moveBestseller(index, targetIndex);
    showToast("Bestsellers order updated!");
  };

  const availableProducts = products.filter((p) => !bestsellerIds.includes(p.id));

  return (
    <div className="min-h-screen bg-cream p-5 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-chocolate hover:text-rose transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Dashboard
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-black text-chocolate uppercase flex items-center gap-2">
              <Star className="h-8 w-8 text-rose fill-rose" />
              Manage Bestsellers
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Select and reorder products featured in the &quot;FOUR BAKES PEOPLE FIGHT OVER&quot; storefront section.
            </p>
          </div>

          <Link
            href="/#shop"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-chocolate text-white text-xs font-bold rounded-full hover:bg-rose transition-colors shadow-badge self-start sm:self-auto"
          >
            <Sparkles className="h-4 w-4" /> View Live Section
          </Link>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Featured Bestsellers List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-lift space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="font-display text-xl font-black text-chocolate uppercase flex items-center gap-2">
                    Active Bestsellers ({bestsellerProducts.length})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    These items display on the main landing page grid in this exact order.
                  </p>
                </div>
              </div>

              {bestsellerProducts.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground bg-cream rounded-2xl border border-dashed border-border p-6">
                  No bestsellers selected yet. Add products from the catalog on the right.
                </div>
              ) : (
                <div className="space-y-3">
                  {bestsellerProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className="bg-cream p-4 rounded-2xl border border-border flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose text-white text-xs font-black shrink-0">
                          #{idx + 1}
                        </span>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-chocolate text-sm truncate">{product.name}</h3>
                          <p className="text-[11px] text-muted-foreground uppercase font-semibold">
                            {product.category} • ₹{product.price || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className="p-2 rounded-xl bg-card border border-border text-chocolate hover:bg-blush disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === bestsellerProducts.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className="p-2 rounded-xl bg-card border border-border text-chocolate hover:bg-blush disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(product.id, product.name)}
                          className="p-2 rounded-xl bg-card border border-border text-rose hover:bg-blush transition-colors"
                          title="Remove from Bestsellers"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Products from Catalog */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-lift space-y-5">
              <div className="border-b border-border pb-4">
                <h2 className="font-display text-xl font-black text-chocolate uppercase">
                  Add From Catalog ({availableProducts.length})
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click to add products from your full bakery catalog to the bestsellers grid.
                </p>
              </div>

              {availableProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-cream rounded-2xl border border-border p-4">
                  All catalog products are already featured as bestsellers!
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {availableProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-cream p-3.5 rounded-2xl border border-border flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-chocolate text-xs truncate">{p.name}</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                            {p.category} • ₹{p.price || 0}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(p.id, p.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer shrink-0 shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
