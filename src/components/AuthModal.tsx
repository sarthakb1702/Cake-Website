"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Mail, UserCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  returnUrl?: string;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      setSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message || "Authentication failed. Please check credentials.");
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-cream p-8 shadow-lift border border-border"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-cream-white text-chocolate hover:bg-blush transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blush text-rose">
              <Lock className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-display text-2xl font-black text-chocolate uppercase">
              {isSignUp ? "Create Account" : "Sign In to Access Cart"}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {isSignUp
                ? "Join Shreya's Home Bakery for artisan bakes & express checkout."
                : "Please sign in to view your cart and place your order."}
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-destructive/10 p-3 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-bold text-chocolate mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full h-12 rounded-2xl border border-border bg-cream-white px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-rose"
                />
                <Mail className="absolute right-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-2xl border border-border bg-cream-white px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-rose"
                />
                <Lock className="absolute right-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 h-13 w-full rounded-full bg-rose text-sm font-bold text-white shadow-badge transition-transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Processing..." : isSignUp ? "Register Account" : "Sign In & Continue"}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-cream-white text-sm font-semibold text-chocolate hover:bg-blush transition-colors cursor-pointer"
          >
            <UserCheck className="h-4 w-4 text-rose" />
            Continue with Google
          </button>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-rose hover:underline"
            >
              {isSignUp ? "Sign In" : "Register Now"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
