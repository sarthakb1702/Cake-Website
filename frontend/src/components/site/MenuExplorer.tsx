import { useState } from "react";
import { motion } from "motion/react";
import { SectionLabel } from "./decor";
import { menuTabs, menuItems } from "@/lib/site-data";

export function MenuExplorer() {
  const [active, setActive] = useState<(typeof menuTabs)[number]>("Cakes");

  return (
    <section id="flavours" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div>
          <SectionLabel>Flavour explorer</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,4.6vw,3.9rem)] leading-[0.95] font-black uppercase">
            Pick your
            <br />
            sugar lane
          </h2>
        </div>
        <div className="no-scrollbar -mx-5 flex w-full gap-2 overflow-x-auto px-5 md:mx-0 md:w-auto md:px-0">
          {menuTabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={
                t === active
                  ? "shrink-0 rounded-full bg-chocolate px-6 py-3 text-sm font-semibold text-cream-white"
                  : "shrink-0 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-chocolate transition-colors hover:border-rose hover:text-rose"
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar -mx-5 mt-12 flex snap-x gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {menuItems[active].map((item, i) => (
          <motion.article
            key={`${active}-${item.name}`}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className="group w-[72vw] shrink-0 snap-start overflow-hidden rounded-[2rem] border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:w-[46vw] md:w-auto"
          >
            <div className="overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between gap-3 p-5">
              <div>
                <h3 className="font-display text-lg leading-tight font-bold">{item.name}</h3>
                <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  {item.tag}
                </p>
              </div>
              <span className="font-display text-lg font-black text-rose">{item.price}</span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
