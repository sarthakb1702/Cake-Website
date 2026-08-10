import { motion } from "motion/react";
import { Star } from "lucide-react";
import { SectionLabel } from "./decor";
import { testimonials } from "@/lib/site-data";

const tones: Record<string, string> = {
  blush: "bg-blush",
  butter: "bg-butter",
  pistachio: "bg-pistachio",
};

export function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionLabel>Kind words</SectionLabel>
        <h2 className="mt-5 max-w-xl font-display text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[0.96] font-black uppercase">
          People who
          <br />
          licked the plate
        </h2>
      </div>

      <div className="no-scrollbar mt-12 flex snap-x gap-6 overflow-x-auto px-5 pb-6 md:px-10">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={`w-[80vw] shrink-0 snap-start rounded-[2rem] p-8 sm:w-[22rem] ${tones[t.tone]}`}
          >
            <div className="flex gap-1 text-chocolate">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-5 font-display text-lg leading-snug font-semibold text-chocolate">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-7">
              <p className="text-sm font-bold text-chocolate">{t.name}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
