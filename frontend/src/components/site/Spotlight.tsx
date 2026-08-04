import { motion } from "motion/react";
import { WheatOff, Milk, Nut, Sparkles } from "lucide-react";
import { SectionLabel, FloatingSparkle } from "./decor";
import { img } from "@/lib/site-data";

const badges = [
  { icon: WheatOff, label: "Gluten-free option" },
  { icon: Milk, label: "Contains dairy" },
  { icon: Nut, label: "Contains nuts" },
  { icon: Sparkles, label: "No preservatives" },
];

export function Spotlight() {
  return (
    <section className="grain relative overflow-hidden bg-chocolate py-20 md:py-28">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:px-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[3rem] bg-blush/20" />
          <img
            src={img("1519915028121-7d3463d20b13", 1000)}
            alt="Pistachio Rosé cake of the month"
            loading="lazy"
            className="relative aspect-[5/4] w-full rounded-[2.5rem] object-cover shadow-lift"
          />
          <FloatingSparkle className="-top-4 -right-2 text-butter" size="h-8 w-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <SectionLabel>Cake of the month</SectionLabel>
          <h2 className="mt-6 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[0.95] font-black text-cream-white uppercase">
            Pistachio
            <br />
            Rosé
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream-white/70">
            Sicilian pistachio sponge soaked in rose syrup, layered with whipped mascarpone and a
            thin ribbon of sour cherry. Finished with candied petals and a dusting of crushed
            pistachio praline. Baked in batches of twelve, every morning.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
            {badges.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2.5 rounded-2xl border border-cream-white/12 px-4 py-3"
              >
                <b.icon className="h-4 w-4 shrink-0 text-blush" />
                <span className="text-[11px] font-medium text-cream-white/80">{b.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-9 flex items-center gap-5">
            <button className="rounded-full bg-rose px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:brightness-110">
              Add to Cart
            </button>
            <span className="font-display text-2xl font-black text-cream-white">$38</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
