"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, ShieldAlert } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userRole, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;

    if (isLoginPage) {
      if (currentUser && userRole === "admin") {
        router.replace("/admin");
      } else {
        setIsAuthorized(true);
      }
      return;
    }

    // Check if user is authenticated AND possesses admin role
    if (!currentUser || userRole !== "admin") {
      setIsAuthorized(false);
      toast.error("Access Denied: Admin privileges required.");
      router.replace("/");
    } else {
      setIsAuthorized(true);
    }
  }, [currentUser, userRole, loading, isLoginPage, router]);

  // Loading & render protection: display sleek spinner while verifying auth state
  if (loading || isAuthorized === null || (!isAuthorized && !isLoginPage)) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <Toaster />
        <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-lift max-w-md w-full flex flex-col items-center justify-center space-y-5">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-blush border-t-rose animate-spin" />
            <Loader2 className="h-7 w-7 text-rose animate-spin absolute" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-butter/40 px-3.5 py-1 text-[11px] font-bold text-chocolate border border-butter mb-2 uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5 text-rose" /> Security Verification
            </span>
            <h3 className="font-display font-black text-xl text-chocolate uppercase tracking-wide">
              Verifying Access
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Authenticating credentials and checking administrative permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      {children}
    </>
  );
}
