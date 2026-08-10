"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <path
        d="M12 2c.6 4.6 2.8 6.8 7.4 7.4-4.6.6-6.8 2.8-7.4 7.4-.6-4.6-2.8-6.8-7.4-7.4C9.2 8.8 11.4 6.6 12 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("h-4 w-4", className)}>
      <path d="M12 3l6 9-6 9-6-9 6-9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function FloatingSparkle({
  className,
  size = "h-6 w-6",
}: {
  className?: string;
  delay?: number;
  size?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute opacity-80", className)}
    >
      <Sparkle className={size} />
    </div>
  );
}

export function HandUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 14"
      fill="none"
      aria-hidden="true"
      className={cn("absolute -bottom-2 left-0 w-full", className)}
      preserveAspectRatio="none"
    >
      <path
        d="M2 9c38-6 78-8 116-5 32 2 60 6 100 1"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RotatingStamp({ className }: { className?: string }) {
  const text = "HANDCRAFTED • FRESH CAKES DAILY • HANDCRAFTED • FRESH CAKES DAILY • ";
  return (
    <div
      className={cn("relative h-20 w-20 shrink-0", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full animate-spin"
        style={{ animationDuration: "14s" }}
      >
        <defs>
          <path id="stampCircle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <circle cx="50" cy="50" r="47" fill="currentColor" opacity="0.1" />
        <text
          className="fill-current"
          style={{ fontSize: "6.8px", letterSpacing: "0.03em", fontWeight: 700 }}
        >
          <textPath href="#stampCircle" textLength="226" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkle className="h-5 w-5" />
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-chocolate uppercase">
      <Sparkle className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export const revealUp = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0 },
};

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
