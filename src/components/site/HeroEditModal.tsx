"use client";

import { useEffect, useState } from "react";
import { HeroSlide, useHeroStore } from "@/lib/hero-store";
import { X, Upload, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface HeroEditModalProps {
  slide: HeroSlide;
  isOpen: boolean;
  onClose: () => void;
}

export function HeroEditModal({ slide, isOpen, onClose }: HeroEditModalProps) {
  const { updateSlide } = useHeroStore();

  const [mainTitle, setMainTitle] = useState(
    slide.mainTitle || "Life's too short to eat boring cake"
  );
  const [subDescription, setSubDescription] = useState(
    slide.subDescription ||
      "Small-batch 100% eggless cakes baked at dawn, finished by hand, and delivered to your door."
  );
  const [badgeTitle, setBadgeTitle] = useState(slide.name);
  const [note, setNote] = useState(slide.note);
  const [price, setPrice] = useState(slide.price);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const initialImage = slide.imageUrl || slide.photoUrl || slide.slideImagePhoto || slide.image || slide.bannerUrl || "";
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [imageUrlInput, setImageUrlInput] = useState(initialImage);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slide && isOpen) {
      setMainTitle(slide.mainTitle || "Life's too short to eat boring cake");
      setSubDescription(
        slide.subDescription ||
          "Small-batch 100% eggless cakes baked at dawn, finished by hand, and delivered to your door."
      );
      setBadgeTitle(slide.name || "");
      setNote(slide.note || "");
      setPrice(slide.price || "");
      const img = slide.imageUrl || slide.photoUrl || slide.slideImagePhoto || slide.image || slide.bannerUrl || "";
      setImagePreview(img);
      setImageUrlInput(img);
      setImageFile(null);
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const finalImage = imagePreview || imageUrlInput || slide.imageUrl || slide.image;

    try {
      const formData = new FormData();
      formData.append("id", slide.id);
      formData.append("name", badgeTitle);
      formData.append("note", note);
      formData.append("price", price);
      formData.append("mainTitle", mainTitle);
      formData.append("subDescription", subDescription);
      formData.append("existingImage", finalImage);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        body: formData,
      });

      let updatedImageUrl = finalImage;
      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          updatedImageUrl = data.imageUrl;
        }
      }

      updateSlide(slide.id, {
        name: badgeTitle,
        note,
        price,
        mainTitle,
        subDescription,
        image: updatedImageUrl,
        imageUrl: updatedImageUrl,
        photoUrl: updatedImageUrl,
        slideImagePhoto: updatedImageUrl,
        bannerUrl: updatedImageUrl,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Error saving hero slide:", err);
      updateSlide(slide.id, {
        name: badgeTitle,
        note,
        price,
        mainTitle,
        subDescription,
        image: finalImage,
        imageUrl: finalImage,
        photoUrl: finalImage,
        slideImagePhoto: finalImage,
        bannerUrl: finalImage,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-card p-6 md:p-8 shadow-lift border border-border space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E86A7A] text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="font-display text-2xl font-black text-chocolate uppercase">
              Edit Hero Slide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-chocolate hover:bg-blush transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-2xl bg-pistachio/50 p-4 text-xs font-bold text-chocolate border border-pistachio">
            <CheckCircle2 className="h-5 w-5 text-chocolate shrink-0" />
            <span>Hero slide updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Hero Headline */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
              Main Hero Title / Headline
            </label>
            <input
              type="text"
              required
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              placeholder="e.g. Life's too short to eat boring cake"
              className="w-full text-sm font-bold border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
            />
          </div>

          {/* Hero Sub-description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
              Hero Sub-Description
            </label>
            <textarea
              rows={3}
              required
              value={subDescription}
              onChange={(e) => setSubDescription(e.target.value)}
              placeholder="Small-batch 100% eggless cakes baked at dawn..."
              className="w-full text-xs border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A] leading-relaxed"
            />
          </div>

          {/* Badge Title & Price Tag */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                Badge Title (Cake Name)
              </label>
              <input
                type="text"
                required
                value={badgeTitle}
                onChange={(e) => setBadgeTitle(e.target.value)}
                placeholder="e.g. Belgian Chocolate Truffle"
                className="w-full text-xs font-bold border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                Price Tag
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. ₹950"
                className="w-full text-xs font-bold border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
            </div>
          </div>

          {/* Badge Sub-note */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
              Badge Description / Note
            </label>
            <input
              type="text"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Rich, smooth 100% eggless Belgian chocolate..."
              className="w-full text-xs border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
            />
          </div>

          {/* Image Upload & Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
              Slide Image Photo
            </label>

            <div className="grid gap-4 sm:grid-cols-3 items-center">
              <div className="h-32 w-full rounded-2xl overflow-hidden border border-border bg-cream flex items-center justify-center relative shadow-soft">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <label className="flex items-center justify-center gap-2 h-16 border-2 border-dashed border-[#E86A7A]/40 rounded-2xl bg-blush/30 hover:bg-blush/60 transition-colors cursor-pointer p-3 text-center">
                  <Upload className="h-5 w-5 text-[#E86A7A]" />
                  <span className="text-xs font-bold text-chocolate">
                    {imageFile ? imageFile.name : "Select new image file"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="Or paste image URL"
                  className="w-full text-xs border border-border rounded-xl p-2.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full text-xs font-bold text-chocolate bg-cream border border-border hover:bg-blush transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-full text-xs font-bold text-white bg-[#E86A7A] hover:bg-[#d65767] transition-all shadow-badge disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Hero Slide"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
