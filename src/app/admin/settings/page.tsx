"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Shield, Store, MapPin, Save, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";

const DEFAULT_PICKUP_ADDRESS = "Behind Nishigandha Hospital, Shevgaon";

export default function StoreSettingsPage() {
  const [pickupAddress, setPickupAddress] = useState(DEFAULT_PICKUP_ADDRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, "settings", "storeConfig");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.pickupAddress) {
            setPickupAddress(data.pickupAddress);
          }
        }
      } catch (error) {
        console.error("Error fetching store settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupAddress.trim()) {
      toast.error("Pickup address cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      const docRef = doc(db, "settings", "storeConfig");
      await setDoc(
        docRef,
        {
          pickupAddress: pickupAddress.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("Pickup location updated successfully!");
    } catch (error) {
      console.error("Error updating store config:", error);
      toast.error("Failed to update store settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-5 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-butter/40 px-3.5 py-1 text-xs font-bold text-chocolate border border-butter">
              <Shield className="h-3.5 w-3.5 text-chocolate" />
              Bakery Configuration
            </span>
            <h1 className="mt-2 font-display text-3xl font-black text-chocolate uppercase">
              Store Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage global pickup locations and store defaults for customer checkout.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-chocolate text-xs font-bold rounded-full hover:bg-blush transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Store Settings Form Card */}
        <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-lift space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blush text-rose">
              <Store className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-chocolate">Store Pickup Configuration</h2>
              <p className="text-xs text-muted-foreground">
                This address is rendered live to customers during checkout when selecting Store Pickup.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-8 w-8 rounded-full border-4 border-blush border-t-rose animate-spin mx-auto" />
              <p className="text-xs font-bold text-chocolate">Loading store settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-rose" />
                  Store Pickup Address
                </label>
                <textarea
                  required
                  rows={3}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Behind Nishigandha Hospital, Shevgaon"
                  className="w-full rounded-2xl border border-border bg-cream p-4 text-xs font-medium text-chocolate outline-none focus:ring-2 focus:ring-rose"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Default address: <span className="font-bold text-chocolate">{DEFAULT_PICKUP_ADDRESS}</span>
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/50 p-4 border border-secondary flex items-center gap-3 text-xs text-chocolate">
                <Sparkles className="h-5 w-5 text-rose shrink-0" />
                <span>
                  Updates to this setting immediately propagate across the live storefront checkout and admin notifications.
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-chocolate text-white text-xs font-bold rounded-full hover:bg-rose transition-all shadow-badge cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving Settings..." : "Save Settings"}
                </button>

                <button
                  type="button"
                  onClick={() => setPickupAddress(DEFAULT_PICKUP_ADDRESS)}
                  className="px-6 py-4 border border-border text-chocolate text-xs font-bold rounded-full hover:bg-blush transition-colors cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
