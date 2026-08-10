"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { FloatingSparkle } from "./decor";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      await addDoc(collection(db, "subscribers"), {
        email: email.trim(),
        discountCode: "WELCOME10",
        createdAt: serverTimestamp(),
      });

      setMessage({
        type: "success",
        text: "Discount code WELCOME10 claimed successfully! Check your inbox.",
      });
      setEmail("");
    } catch (err: any) {
      console.error("Error writing discount subscription:", err);
      setMessage({
        type: "error",
        text: err?.message || "Failed to claim discount. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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
          Subscribe for fresh weekend drops, exclusive cake flavors, and sweet surprises.
        </p>

        {message && (
          <div
            className={`mx-auto mt-6 flex max-w-lg items-center justify-center gap-2 rounded-2xl p-4 text-xs font-bold shadow-sm transition-all ${
              message.type === "success"
                ? "bg-pistachio/50 text-chocolate border border-pistachio"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-chocolate" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="you@email.com"
            className="h-14 flex-1 rounded-full bg-cream-white px-6 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-rose disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-14 rounded-full bg-chocolate px-8 text-sm font-semibold text-cream-white transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-cream-white" />
                <span>Claiming...</span>
              </>
            ) : (
              "Claim Discount"
            )}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
