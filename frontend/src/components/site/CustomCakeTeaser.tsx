import { motion } from "motion/react";
import { IceCreamCone, Palette, PenLine } from "lucide-react";
import { SectionLabel, revealUp, staggerParent, FloatingSparkle } from "./decor";

const steps = [
  { n: "01", icon: IceCreamCone, title: "Choose flavour", copy: "Twelve sponges, nine fillings, one very happy decision." },
  { n: "02", icon: Palette, title: "Pick design", copy: "Minimal, floral, sculptural or gloriously chaotic." },
  { n: "03", icon: PenLine, title: "Add message", copy: "Piped by hand in our house script. Emojis welcome." },
];

export function CustomCakeTeaser() {
  return (
    <section id="custom" className="relative overflow-hidden bg-secondary py-24 md:py-32">
      <FloatingSparkle className="top-12 left-[12%] text-rose" size="h-8 w-8" />
      <FloatingSparkle className="bottom-16 right-[10%] text-chocolate" delay={0.8} />
      <div className="mx-auto max-w-[1400px] px-5 text-center md:px-10">
        <SectionLabel>Custom cakes</SectionLabel>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(2.2rem,4.8vw,3.9rem)] leading-[0.95] font-black uppercase">
          Build a cake
          <br />
          that&apos;s only yours
        </h2>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="relative mt-16 grid gap-6 md:grid-cols-3"
        >
          <div className="absolute top-[4.5rem] right-[16%] left-[16%] hidden border-t-2 border-dashed border-chocolate/25 md:block" />
          {steps.map((s) => (
            <motion.div
              key={s.n}
              variants={revealUp}
              className="relative rounded-[2rem] bg-card p-8 text-left shadow-soft transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose text-cream-white">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="font-display text-3xl font-black text-border">{s.n}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
            </motion.div>
          ))}
        </motion.div>

        <button className="mt-12 rounded-full bg-chocolate px-9 py-4 text-sm font-semibold text-cream-white transition-all hover:scale-105 hover:bg-rose">
          Start Designing Your Cake
        </button>
      </div>
    </section>
  );
}
