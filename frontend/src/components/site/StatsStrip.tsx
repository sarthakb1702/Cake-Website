import { Leaf, Cake, Truck, Star } from "lucide-react";
import { stats } from "@/lib/site-data";

const icons = { leaf: Leaf, cake: Cake, truck: Truck, star: Star };

export function StatsStrip() {
  return (
    <section className="border-y border-border bg-card/60" id="delivery">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-border px-5 md:grid-cols-4 md:divide-x md:px-10">
        {stats.map((s) => {
          const Icon = icons[s.icon as keyof typeof icons];
          return (
            <div
              key={s.label}
              className="flex items-center justify-center gap-3 px-4 py-6 text-center md:py-7"
            >
              <Icon className="h-4 w-4 shrink-0 text-rose" />
              <span className="text-[11px] font-semibold tracking-[0.13em] text-chocolate uppercase md:text-xs">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
