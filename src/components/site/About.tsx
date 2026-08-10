"use client";

import { motion } from "motion/react";
import { SectionLabel, HandUnderline } from "./decor";
import { useAuth } from "@/context/AuthContext";
import { useAboutStore } from "@/lib/about-store";
import { AdminEditButton } from "@/components/AdminEditButton";

export function About() {
  const { userRole } = useAuth();
  const { aboutData } = useAboutStore();
  const isAdmin = userRole === "admin";

  return (
    <section id="story" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32 relative">
      {isAdmin && (
        <div className="absolute top-8 right-10 z-30">
          <AdminEditButton href="/admin/about" label="Manage About Section" />
        </div>
      )}
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="relative h-[26rem] md:h-[32rem]"
        >
          <img
            src={aboutData.photo1}
            alt="Our baker finishing a cake by hand"
            loading="lazy"
            className="absolute top-0 left-0 h-[70%] w-[62%] rounded-[2rem] object-cover shadow-lift"
          />
          <img
            src={aboutData.photo2}
            alt="Decorating a custom cake in the kitchen"
            loading="lazy"
            className="absolute right-0 bottom-0 h-[62%] w-[54%] rounded-[2rem] border-4 border-background object-cover shadow-lift"
          />
          <div className="absolute top-[38%] left-[46%] h-24 w-24 rounded-full bg-butter" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <SectionLabel>Our story</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[0.96] font-black uppercase text-chocolate">
            {aboutData.title || "Two ovens, one stubborn standard"}
          </h2>
          <div className="mt-8 max-w-lg space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>{aboutData.storyLine1}</p>
            <p>{aboutData.storyLine2}</p>
          </div>
          <div className="mt-9 flex gap-10">
            {[
              [aboutData.foundedYear || "2018", "Founded"],
              [aboutData.cakesServed || "500+", "Cakes served"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-black text-chocolate">{v}</p>
                <p className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
