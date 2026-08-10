"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { IceCreamCone, Palette, PenLine } from "lucide-react";
import { SectionLabel, revealUp, staggerParent, FloatingSparkle } from "./decor";
import { useAuth } from "@/context/AuthContext";
import { useCustomBakesStore } from "@/lib/custom-bakes-store";
import { AdminEditButton } from "@/components/AdminEditButton";

const icons = [IceCreamCone, Palette, PenLine];

export function CustomCakeTeaser() {
  const { userRole } = useAuth();
  const { customBakes } = useCustomBakesStore();
  const isAdmin = userRole === "admin";

  const displaySteps =
    customBakes.steps && customBakes.steps.length >= 3
      ? customBakes.steps
      : [
          { n: "01", title: "Choose shape & weight", copy: "Round, Heart, or Square shapes from 0.5kg to 2.0kg." },
          { n: "02", title: "100% Eggless Sponges", copy: "Rich Belgian chocolate, Red Velvet, or classic fruit layers." },
          { n: "03", title: "Custom Message & Order", copy: "Add custom piped message & schedule express pickup." },
        ];

  return (
    <section id="custom" className="relative overflow-hidden bg-secondary py-24 md:py-32">
      <FloatingSparkle className="top-12 left-[12%] text-rose" size="h-8 w-8" />
      <FloatingSparkle className="bottom-16 right-[10%] text-chocolate" delay={0.8} />
      <div className="mx-auto max-w-[1400px] px-5 text-center md:px-10">
        <SectionLabel>{customBakes.sectionTitle || "Custom cakes"}</SectionLabel>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(2.2rem,4.8vw,3.9rem)] leading-[0.95] font-black uppercase text-chocolate">
          {customBakes.sectionSubtitle || "Build a cake that's only yours"}
        </h2>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="relative mt-16 grid gap-6 md:grid-cols-3"
        >
          <div className="absolute top-[4.5rem] right-[16%] left-[16%] hidden border-t-2 border-dashed border-chocolate/25 md:block" />
          {displaySteps.map((s, i) => {
            const IconComp = icons[i % icons.length];
            return (
              <motion.div
                key={s.n + i}
                variants={revealUp}
                className="relative rounded-[2rem] bg-card p-8 text-left shadow-soft transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E86A7A] text-cream-white">
                    <IconComp className="h-6 w-6" />
                  </span>
                  <span className="font-display text-3xl font-black text-border">{s.n}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-chocolate">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <Link
          href="/custom-cake"
          className="mt-12 inline-block rounded-full bg-chocolate px-9 py-4 text-sm font-semibold text-cream-white transition-all hover:scale-105 hover:bg-[#E86A7A] cursor-pointer shadow-badge"
        >
          Order Custom Cakes Now
        </Link>
      </div>
    </section>
  );
}
