"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { SectionLabel } from "./decor";
import { useAuth } from "@/context/AuthContext";
import { useReviewsStore } from "@/lib/reviews-store";
import { AdminEditButton } from "@/components/AdminEditButton";

export function Testimonials() {
  const { userRole } = useAuth();
  const { reviews } = useReviewsStore();
  const isAdmin = userRole === "admin";
  const approvedReviews = reviews.filter((r) => r.approved !== false);

  return (
    <section id="reviews" className="w-full py-24 md:py-32 relative">
      {/* Header Container */}
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 relative">
        {isAdmin && (
          <div className="absolute top-0 right-5 md:right-10 z-30">
            <AdminEditButton href="/admin/reviews" label="Manage Reviews" />
          </div>
        )}
        <SectionLabel>Kind words</SectionLabel>
        <h2 className="mt-5 max-w-xl font-display text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[0.96] font-black uppercase text-chocolate">
          People who
          <br />
          licked the plate
        </h2>
      </div>

      {/* Full-Width Carousel Track */}
      <div className="flex overflow-x-auto gap-4 px-4 w-full scrollbar-none snap-x snap-mandatory mt-12 pb-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:px-10 md:max-w-[1400px] md:mx-auto md:overflow-visible no-scrollbar">
        {approvedReviews.map((t, i) => (
          <motion.figure
            key={t.id || t.name + i}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="w-[85vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none rounded-[2rem] p-8 bg-blush border border-rose/15 shadow-soft flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-1 text-[#E86A7A]">
                {Array.from({ length: t.rating || 5 }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-5 font-display text-lg leading-snug font-semibold text-chocolate">
                “{t.quote}”
              </blockquote>
            </div>
            <figcaption className="mt-7">
              <p className="text-sm font-bold text-chocolate">{t.name}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
