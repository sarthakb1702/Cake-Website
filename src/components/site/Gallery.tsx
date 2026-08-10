"use client";

import { motion } from "motion/react";
import { Sparkle } from "./decor";
import { useAuth } from "@/context/AuthContext";
import { useGalleryStore } from "@/lib/gallery-store";
import { AdminEditButton } from "@/components/AdminEditButton";

export function Gallery() {
  const { userRole } = useAuth();
  const { galleryItems } = useGalleryStore();
  const isAdmin = userRole === "admin";

  const INSTAGRAM_URL = "https://www.instagram.com/shreyas_home_bakery2503?igsh=MWlyam81eTl3MHUwYQ==";

  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32 relative">
      {isAdmin && (
        <div className="absolute top-0 right-10 z-30">
          <AdminEditButton href="/admin/gallery" label="Manage Gallery Images" />
        </div>
      )}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-tight font-black uppercase text-chocolate">
            Follow us <span className="text-rose group-hover:underline">@SHREYAS_HOME_BAKERY2503</span>
            <Sparkle className="mb-2 ml-2 inline h-6 w-6 text-butter" />
          </h2>
        </a>
        <p className="text-sm text-muted-foreground">Fresh bakes daily, handcrafted in small batches.</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {galleryItems.map((item, i) => (
          <motion.a
            key={item.id || i}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
            className="group relative block aspect-square overflow-hidden rounded-2xl cursor-pointer shadow-soft border border-border/40"
          >
            <img
              src={item.url}
              alt={item.caption || "Shreya's Home Bakery bakes"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </motion.a>
        ))}
      </div>
    </section>
  );
}
