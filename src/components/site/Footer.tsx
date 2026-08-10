"use client";

import Link from "next/link";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

const columns = [
  {
    title: "Bakery",
    links: [
      { label: "Full Catalog", href: "/catalog" },
      { label: "Artisan Cakes", href: "/cakes" },
      { label: "Fresh Donuts", href: "/donuts" },
      { label: "Belgian Fudge", href: "/fudge" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "User Profile", href: "/profile" },
      { label: "View Cart", href: "/cart" },
      { label: "My Orders", href: "/orders" },
      { label: "Sign In", href: "/login" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Same-Day Delivery", href: "/catalog" },
      { label: "100% Eggless Menu", href: "/catalog" },
      { label: "Custom Cake Orders", href: "/custom-cake" },
    ],
  },
];

export function Footer() {
  const INSTAGRAM_URL = "https://www.instagram.com/shreyas_home_bakery2503?igsh=MWlyam81eTl3MHUwYQ==";

  return (
    <footer className="grain relative overflow-hidden bg-chocolate pt-20 text-cream-white">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.3fr_repeat(3,0.7fr)]">
          <div>
            <div className="flex items-center gap-4">
              <span className="font-display text-2xl font-black">
                Shreya's <span className="text-blush">Home</span> Bakery
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-white/60">
              Small-batch 100% eggless artisan cakes, baked fresh at dawn. Delivered the same day straight to your doorstep.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Shreya's Home Bakery on Instagram"
                className="flex items-center gap-2.5 rounded-full border border-cream-white/20 bg-chocolate px-4 py-2.5 text-xs font-bold text-cream-white transition-all hover:bg-rose hover:border-rose shadow-soft cursor-pointer max-w-full"
              >
                <InstagramIcon className="h-4 w-4 text-cream-white shrink-0" />
                <span className="truncate">@shreyas_home_bakery2503</span>
              </a>
            </div>
          </div>

          {columns.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-blush uppercase">
                {c.title}
              </p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-cream-white/70 transition-colors hover:text-cream-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-cream-white/10 py-7 text-xs text-cream-white/45 sm:flex-row sm:justify-between">
          <p>© 2026 Shreya's Home Bakery. All rights reserved.</p>
          <p>Privacy · Terms · Cookies</p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none -mb-4 text-center font-display text-[clamp(3.4rem,15vw,13rem)] leading-none font-black tracking-tighter text-transparent select-none"
        style={{ WebkitTextStroke: "1px color-mix(in oklab, white 16%, transparent)" }}
      >
        Shreya's Home Bakery
      </p>
    </footer>
  );
}
