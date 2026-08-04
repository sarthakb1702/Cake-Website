"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { auth, db } from "../../../lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const { currentUser, userRole, signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && currentUser && userRole === "admin") {
      router.replace("/admin");
    }
  }, [currentUser, loading, router, userRole]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithEmail(email, password);
      const user = auth.currentUser;

      if (!user) {
        setError("Unauthorized access");
        setSubmitting(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.data()?.role;

      if (role !== "admin") {
        setError("Unauthorized access");
        setSubmitting(false);
        return;
      }

      router.replace("/admin");
    } catch (err: any) {
      setError(err?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-stone-500">Loading...</div>;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-10">
      <div className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Admin Access</p>
          <h1 className="text-2xl font-extrabold text-stone-900">Administrator Login</h1>
          <p className="text-sm text-stone-600">Sign in with your admin email and password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </div>

          {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
