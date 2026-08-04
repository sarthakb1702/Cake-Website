import { motion } from "motion/react";
import { FloatingSparkle } from "./decor";

export function Newsletter() {
  return (
    <section className="px-5 pb-24 md:px-10 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="grain relative mx-auto max-w-[1400px] overflow-hidden rounded-[2.5rem] bg-blush px-6 py-16 text-center md:px-16 md:py-20"
      >
        <FloatingSparkle className="top-8 left-[8%] text-chocolate" />
        <FloatingSparkle className="bottom-10 right-[9%] text-cream-white" delay={0.9} size="h-8 w-8" />
        <h2 className="mx-auto max-w-2xl font-display text-[clamp(2rem,4.4vw,3.5rem)] leading-[0.96] font-black text-chocolate uppercase">
          Get 10% off your
          <br />
          first order
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-chocolate/70">
          One email a month: new flavours, weekend drops, and nothing else.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            className="h-14 flex-1 rounded-full bg-cream-white px-6 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-rose"
          />
          <button
            type="submit"
            className="h-14 rounded-full bg-chocolate px-8 text-sm font-semibold text-cream-white transition-transform hover:scale-105"
          >
            Claim Discount
          </button>
        </form>
      </motion.div>
    </section>
  );
}
