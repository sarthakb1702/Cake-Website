import { motion } from "motion/react";
import { gallery } from "@/lib/site-data";
import { Sparkle } from "./decor";

export function Gallery() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-tight font-black uppercase">
          Follow us <span className="text-rose">@crumbandco</span>
          <Sparkle className="mb-2 ml-2 inline h-6 w-6 text-butter" />
        </h2>
        <p className="text-sm text-muted-foreground">Fresh crumbs daily, mostly in close-up.</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {gallery.map((src, i) => (
          <motion.div
            key={src + i}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
            className="group relative aspect-square overflow-hidden rounded-2xl"
          >
            <img
              src={src}
              alt="Crumb & Co. bakes on Instagram"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute inset-0 bg-chocolate/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
