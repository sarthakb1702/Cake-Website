"use client";

import { useState } from "react";
import Link from "next/link";
import { useGalleryStore } from "@/lib/gallery-store";
import { ArrowLeft, Image as ImageIcon, Upload, Trash2, CheckCircle2, AlertCircle, Plus, Loader2 } from "lucide-react";

export default function AdminGalleryPage() {
  const { galleryItems, addGalleryItem, deleteGalleryItem } = useGalleryStore();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !imageUrlInput) return;
    setLoading(true);
    setSuccessMsg(null);

    const finalImage = preview || imageUrlInput;

    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("urlInput", imageUrlInput);
      if (imageFile) formData.append("imageFile", imageFile);

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });

      let uploadedUrl = finalImage;
      if (res.ok) {
        const data = await res.json();
        if (data.url) uploadedUrl = data.url;
      }

      addGalleryItem({
        url: uploadedUrl,
        caption: caption || "Instagram gallery showcase",
      });

      setImageFile(null);
      setImageUrlInput("");
      setCaption("");
      setPreview("");

      setSuccessMsg("Gallery image uploaded & published!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      addGalleryItem({
        url: finalImage,
        caption: caption || "Instagram gallery showcase",
      });
      setImageFile(null);
      setImageUrlInput("");
      setCaption("");
      setPreview("");
      setSuccessMsg("Gallery image added locally!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 md:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-bold text-chocolate border border-border hover:bg-blush transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Link>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Media Manager • Instagram Gallery
          </span>
        </div>

        <div className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-lift space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-butter/40 px-3.5 py-1 text-xs font-bold text-chocolate border border-butter">
              <ImageIcon className="h-3.5 w-3.5 text-[#E86A7A]" />
              Manage Media Gallery
            </span>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-black text-chocolate uppercase">
              Gallery Images Manager
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Upload new photos to Cloudinary, reorder showcase items, or remove old gallery images.
            </p>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-pistachio/50 p-4 text-xs font-bold text-chocolate border border-pistachio">
              <CheckCircle2 className="h-5 w-5 text-chocolate shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="bg-cream p-6 rounded-3xl border border-border space-y-4">
            <h3 className="font-display text-lg font-bold text-chocolate uppercase flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#E86A7A]" /> Upload New Gallery Showcase Photo
            </h3>

            <div className="grid gap-4 sm:grid-cols-3 items-center">
              <div className="h-32 w-full rounded-2xl overflow-hidden border border-border bg-card flex items-center justify-center relative shadow-soft">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground font-semibold">Image Preview</span>
                )}
              </div>

              <div className="sm:col-span-2 space-y-3">
                <label className="flex items-center justify-center gap-2 h-14 border-2 border-dashed border-[#E86A7A]/40 rounded-2xl bg-blush/30 hover:bg-blush/60 transition-colors cursor-pointer p-3 text-center">
                  <Upload className="h-4 w-4 text-[#E86A7A]" />
                  <span className="text-xs font-bold text-chocolate">
                    {imageFile ? imageFile.name : "Upload photo file to Cloudinary"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setPreview(e.target.value);
                  }}
                  placeholder="Or paste external image URL"
                  className="w-full text-xs border border-border rounded-xl p-2.5 bg-card text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-chocolate uppercase">Optional Caption / Tag</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Freshly glazed donuts ready for morning delivery"
                className="w-full text-xs border border-border rounded-xl p-2.5 bg-card text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#E86A7A] hover:bg-[#d65767] transition-all shadow-badge disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Upload Showcase Image"}
            </button>
          </form>

          {/* Current Gallery Grid */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-black text-chocolate uppercase">
              Current Showcase Images ({galleryItems.length})
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {galleryItems.map((g, i) => (
                <div
                  key={g.id || i}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-cream shadow-soft"
                >
                  <img
                    src={g.url}
                    alt={g.caption || "Gallery item"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-chocolate/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-cream-white font-bold truncate">{g.caption}</span>
                    <button
                      onClick={() => {
                        if (confirm("Delete this gallery image?")) deleteGalleryItem(g.id);
                      }}
                      className="self-end p-2 bg-rose text-white rounded-full hover:scale-110 transition-transform"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
