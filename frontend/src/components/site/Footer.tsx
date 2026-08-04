import { Instagram, Facebook, Twitter } from "lucide-react";
import { RotatingStamp } from "./decor";

const columns = [
  { title: "Shop", links: ["Cakes", "Cupcakes", "Pastries", "Gift boxes"] },
  { title: "Company", links: ["Our story", "Bakers", "Careers", "Press"] },
  { title: "Support", links: ["Delivery", "Allergens", "Returns", "Contact"] },
];

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-chocolate pt-20 text-cream-white">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.3fr_repeat(3,0.7fr)]">
          <div>
            <div className="flex items-center gap-4">
              <span className="font-display text-2xl font-black">
                Crumb <span className="text-blush">&</span> Co.
              </span>
              <RotatingStamp className="h-14 w-14 text-blush" />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-white/60">
              Small-batch artisan cakes, baked at dawn in Brooklyn. Delivered the same day, still
              slightly warm.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-white/15 transition-colors hover:bg-rose"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-blush uppercase">
                {c.title}
              </p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-cream-white/70 transition-colors hover:text-cream-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-cream-white/10 py-7 text-xs text-cream-white/45 sm:flex-row sm:justify-between">
          <p>© 2026 Crumb & Co. All rights reserved.</p>
          <p>Privacy · Terms · Cookies</p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none -mb-4 text-center font-display text-[clamp(3.4rem,15vw,13rem)] leading-none font-black tracking-tighter text-transparent select-none"
        style={{ WebkitTextStroke: "1px color-mix(in oklab, white 16%, transparent)" }}
      >
        Crumb & Co.
      </p>
    </footer>
  );
}
