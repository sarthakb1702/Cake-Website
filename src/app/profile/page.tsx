"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Phone, MapPin, Building, Mail, Save, CheckCircle, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { currentUser, userProfile, updateUserProfile, signOutUser, loading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login?returnUrl=/profile");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || "");
      setPhone(userProfile.phone || "");
      setAddress(userProfile.address || "");
      setCity(userProfile.city || "");
      setPostalCode(userProfile.postalCode || "");
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-display text-lg text-chocolate">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    await updateUserProfile({
      fullName,
      phone,
      address,
      city,
      postalCode,
    });

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2.5rem] bg-card p-8 shadow-lift border border-border md:p-10">
          <div className="flex items-center justify-between border-b border-border/60 pb-6">
            <div>
              <span className="inline-block rounded-full bg-secondary px-3.5 py-1 text-[11px] font-bold tracking-wider text-chocolate uppercase">
                Account Settings
              </span>
              <h1 className="mt-2 font-display text-3xl font-black text-chocolate uppercase">
                User Profile
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage your personal information & saved delivery address.
              </p>
            </div>
            <button
              onClick={async () => {
                await signOutUser();
                router.push("/");
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-xs font-bold text-chocolate hover:bg-blush transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-rose" />
              Sign Out
            </button>
          </div>

          {savedSuccess && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-pistachio/30 p-4 text-xs font-bold text-chocolate border border-pistachio">
              <CheckCircle className="h-5 w-5 text-chocolate shrink-0" />
              <span>Profile details updated successfully! Your saved address will automatically pre-fill at checkout.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={currentUser.email || ""}
                  className="w-full h-12 rounded-2xl border border-border bg-muted/40 px-4 text-sm text-muted-foreground outline-none"
                />
                <Mail className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full h-12 rounded-2xl border border-border bg-cream-white px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-rose"
                />
                <User className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-12 rounded-2xl border border-border bg-cream-white px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-rose"
                />
                <Phone className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1.5">
                Default Delivery Street Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment, House No., Street Name"
                  className="w-full h-12 rounded-2xl border border-border bg-cream-white px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-rose"
                />
                <MapPin className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1.5">
                  City
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full h-12 rounded-2xl border border-border bg-cream-white px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-rose"
                  />
                  <Building className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="400001"
                  className="w-full h-12 rounded-2xl border border-border bg-cream-white px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-rose"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-rose text-sm font-bold text-white shadow-badge transition-transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving Profile..." : "Save Profile Details"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
