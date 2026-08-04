import { motion } from "motion/react";
import { SectionLabel, revealUp, staggerParent } from "./decor";
import { bestsellers } from "@/lib/site-data";

const tones: Record<string, { bg: string; text: string; sub: string }> = {
  blush: { bg: "bg-blush", text: "text-chocolate", sub: "text-chocolate/70" },
  chocolate: { bg: "bg-chocolate", text: "text-cream-white", sub: "text-cream-white/70" },
  pistachio: { bg: "bg-pistachio", text: "text-chocolate", sub: "text-chocolate/70" },
  butter: { bg: "bg-butter", text: "text-chocolate", sub: "text-chocolate/70" },
};

export function Bestsellers() {
  return (
    <section id="shop" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <SectionLabel>Our Bestsellers</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,4.6vw,3.9rem)] leading-[0.95] font-black uppercase">
            Four cakes
            <br />
            people fight over
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Rotated weekly, never mass produced. Every flavour gets its own colour, because dessert
          should never look shy.
        </p>
      </div>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-24 grid gap-x-6 gap-y-24 sm:grid-cols-2 lg:grid-cols-4"
      >
        {bestsellers.map((p) => {
          const t = tones[p.tone]!;
          return (
            <motion.article
              key={p.name}
              variants={revealUp}
              className={`group relative rounded-[2rem] ${t.bg} px-6 pt-24 pb-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-lift`}
            >
              <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-cream-white/40 shadow-soft">
                <img
                  src={p.image}
                  alt={`${p.name} cake`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <p className={`text-[10px] font-semibold tracking-[0.2em] uppercase ${t.sub}`}>
                {p.tag}
              </p>
              <h3 className={`mt-2 font-display text-2xl leading-tight font-bold ${t.text}`}>
                {p.name}
              </h3>
              <div className="mt-8 flex items-end justify-between">
                <button className={`text-xs font-semibold underline underline-offset-4 ${t.sub} transition-opacity group-hover:opacity-100`}>
                  Add to cart
                </button>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-white font-display text-base font-black text-chocolate shadow-soft">
                  {p.price}
                </span>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
