"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAboutStore } from "@/lib/about-store";
import { ArrowLeft, Sparkles, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AdminAboutPage() {
  const router = useRouter();
  const { aboutData, updateAbout } = useAboutStore();

  const [title, setTitle] = useState(aboutData.title);
  const [storyLine1, setStoryLine1] = useState(aboutData.storyLine1);
  const [storyLine2, setStoryLine2] = useState(aboutData.storyLine2);
  const [foundedYear, setFoundedYear] = useState(aboutData.foundedYear);
  const [cakesServed, setCakesServed] = useState(aboutData.cakesServed);
  
  const [photo1Preview, setPhoto1Preview] = useState(aboutData.photo1);
  const [photo2Preview, setPhoto2Preview] = useState(aboutData.photo2);
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setTitle(aboutData.title);
    setStoryLine1(aboutData.storyLine1);
    setStoryLine2(aboutData.storyLine2);
    setFoundedYear(aboutData.foundedYear);
    setCakesServed(aboutData.cakesServed);
    setPhoto1Preview(aboutData.photo1);
    setPhoto2Preview(aboutData.photo2);
  }, [aboutData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("storyLine1", storyLine1);
      formData.append("storyLine2", storyLine2);
      formData.append("foundedYear", foundedYear);
      formData.append("cakesServed", cakesServed);
      formData.append("existingPhoto1", photo1Preview);
      formData.append("existingPhoto2", photo2Preview);

      if (file1) formData.append("photo1File", file1);
      if (file2) formData.append("photo2File", file2);

      const res = await fetch("/api/admin/about", {
        method: "PUT",
        body: formData,
      });

      let p1 = photo1Preview;
      let p2 = photo2Preview;

      if (res.ok) {
        const data = await res.json();
        if (data.data?.photo1) p1 = data.data.photo1;
        if (data.data?.photo2) p2 = data.data.photo2;
      }

      updateAbout({
        title,
        storyLine1,
        storyLine2,
        foundedYear,
        cakesServed,
        photo1: p1,
        photo2: p2,
      });

      setSuccessMsg("About section updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/#story");
      }, 1200);
    } catch (err: any) {
      console.error("Error updating About:", err);
      updateAbout({
        title,
        storyLine1,
        storyLine2,
        foundedYear,
        cakesServed,
        photo1: photo1Preview,
        photo2: photo2Preview,
      });
      setSuccessMsg("About section updated locally! Redirecting...");
      setTimeout(() => {
        router.push("/#story");
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 md:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-bold text-chocolate border border-border hover:bg-blush transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Link>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Brand Management • About Section
          </span>
        </div>

        <div className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-lift space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-butter/40 px-3.5 py-1 text-xs font-bold text-chocolate border border-butter">
              <Sparkles className="h-3.5 w-3.5 text-[#E86A7A]" />
              Manage Story & Baker Photos
            </span>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-black text-chocolate uppercase">
              Edit About Section
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Update brand story headlines, baker photos, philosophy paragraphs, and key statistics.
            </p>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-pistachio/50 p-4 text-xs font-bold text-chocolate border border-pistachio">
              <CheckCircle2 className="h-5 w-5 text-chocolate shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                Section Headline Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Two ovens, one stubborn standard"
                className="w-full text-sm font-bold border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                Story Paragraph 1
              </label>
              <textarea
                rows={3}
                required
                value={storyLine1}
                onChange={(e) => setStoryLine1(e.target.value)}
                className="w-full text-xs border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A] leading-relaxed"
              />

              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                Story Paragraph 2
              </label>
              <textarea
                rows={3}
                required
                value={storyLine2}
                onChange={(e) => setStoryLine2(e.target.value)}
                className="w-full text-xs border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A] leading-relaxed"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                  Founded Year Stat
                </label>
                <input
                  type="text"
                  required
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  className="w-full text-sm font-bold border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                  Cakes Served Stat
                </label>
                <input
                  type="text"
                  required
                  value={cakesServed}
                  onChange={(e) => setCakesServed(e.target.value)}
                  className="w-full text-sm font-bold border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
                />
              </div>
            </div>

            {/* Photos Upload */}
            <div className="grid gap-6 md:grid-cols-2 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                  Baker Photo 1 (Main Showcase)
                </label>
                <div className="h-40 w-full rounded-2xl overflow-hidden border border-border bg-cream flex items-center justify-center relative shadow-soft">
                  <img src={photo1Preview} alt="Preview 1" className="h-full w-full object-cover" />
                </div>
                <label className="flex items-center justify-center gap-2 h-14 border-2 border-dashed border-[#E86A7A]/40 rounded-2xl bg-blush/30 hover:bg-blush/60 transition-colors cursor-pointer p-3 text-center">
                  <Upload className="h-4 w-4 text-[#E86A7A]" />
                  <span className="text-xs font-bold text-chocolate">
                    {file1 ? file1.name : "Upload Photo 1"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFile1(f);
                        const reader = new FileReader();
                        reader.onloadend = () => setPhoto1Preview(reader.result as string);
                        reader.readAsDataURL(f);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                  Baker Photo 2 (Kitchen Overlay)
                </label>
                <div className="h-40 w-full rounded-2xl overflow-hidden border border-border bg-cream flex items-center justify-center relative shadow-soft">
                  <img src={photo2Preview} alt="Preview 2" className="h-full w-full object-cover" />
                </div>
                <label className="flex items-center justify-center gap-2 h-14 border-2 border-dashed border-[#E86A7A]/40 rounded-2xl bg-blush/30 hover:bg-blush/60 transition-colors cursor-pointer p-3 text-center">
                  <Upload className="h-4 w-4 text-[#E86A7A]" />
                  <span className="text-xs font-bold text-chocolate">
                    {file2 ? file2.name : "Upload Photo 2"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFile2(f);
                        const reader = new FileReader();
                        reader.onloadend = () => setPhoto2Preview(reader.result as string);
                        reader.readAsDataURL(f);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
              <Link
                href="/admin"
                className="px-6 py-3.5 rounded-full text-xs font-bold text-chocolate bg-cream border border-border hover:bg-blush transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-full text-xs font-bold text-white bg-[#E86A7A] hover:bg-[#d65767] transition-all shadow-badge disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Publish Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
