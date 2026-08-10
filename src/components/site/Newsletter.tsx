"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CheckCircle2, AlertCircle, Tag } from "lucide-react";
import { FloatingSparkle } from "./decor";

export function Newsletter() {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check client local storage & user profile on mount
  useEffect(() => {
    const checkUserClaimStatus = async () => {
      const localClaimed = localStorage.getItem("shreyas_discount_claimed") === "true";
      if (localClaimed) {
        setIsAlreadyClaimed(true);
      }

      if (currentUser?.uid) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists() && userSnap.data()?.discountClaimed) {
            setIsAlreadyClaimed(true);
            localStorage.setItem("shreyas_discount_claimed", "true");
          }
        } catch (e) {
          console.warn("Error checking user discount status:", e);
        }
      }
    };

    checkUserClaimStatus();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setLoading(true);
    setMessage(null);

    try {
      // 1. Check local storage fallback for specific email
      if (localStorage.getItem(`discount_claimed_${targetEmail}`) === "true") {
        setMessage({
          type: "error",
          text: "This email has already claimed the 10% discount code!",
        });
        setIsAlreadyClaimed(true);
        setLoading(false);
        return;
      }

      // 2. Query Firestore subscribers collection for existing email
      const subscribersRef = collection(db, "subscribers");
      const q = query(subscribersRef, where("email", "==", targetEmail));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        setMessage({
          type: "error",
          text: "This email has already claimed the 10% discount code!",
        });
        setIsAlreadyClaimed(true);
        localStorage.setItem(`discount_claimed_${targetEmail}`, "true");
        localStorage.setItem("shreyas_discount_claimed", "true");
        setLoading(false);
        return;
      }

      // 3. If user is logged in, check Firestore user profile for discountClaimed flag
      if (currentUser?.uid) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists() && userSnap.data()?.discountClaimed) {
          setMessage({
            type: "error",
            text: "This account has already claimed the 10% discount code!",
          });
          setIsAlreadyClaimed(true);
          localStorage.setItem("shreyas_discount_claimed", "true");
          setLoading(false);
          return;
        }
      }

      // 4. Save new subscriber document
      await addDoc(subscribersRef, {
        email: targetEmail,
        discountCode: "WELCOME10",
        userId: currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });

      // 5. Update user profile if logged in
      if (currentUser?.uid) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, { discountClaimed: true }, { merge: true });
      }

      // 6. Persist claimed state in local storage
      localStorage.setItem("shreyas_discount_claimed", "true");
      localStorage.setItem(`discount_claimed_${targetEmail}`, "true");
      setIsAlreadyClaimed(true);

      setMessage({
        type: "success",
        text: "Discount code WELCOME10 claimed successfully! Use WELCOME10 at checkout.",
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

        {isAlreadyClaimed && !message && (
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-2xl bg-pistachio/50 px-4 py-2.5 text-xs font-extrabold text-chocolate border border-pistachio shadow-xs">
            <Tag className="h-4 w-4 text-chocolate shrink-0" />
            <span>Discount Already Claimed — Use Coupon Code <strong>WELCOME10</strong> at Checkout!</span>
          </div>
        )}

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
            disabled={loading || isAlreadyClaimed}
            placeholder={isAlreadyClaimed ? "Discount already claimed" : "you@email.com"}
            className="h-14 flex-1 rounded-full bg-cream-white px-6 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-rose disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || isAlreadyClaimed}
            className="h-14 rounded-full bg-chocolate px-8 text-sm font-semibold text-cream-white transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-cream-white" />
                <span>Claiming...</span>
              </>
            ) : isAlreadyClaimed ? (
              "Claimed"
            ) : (
              "Claim Discount"
            )}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
