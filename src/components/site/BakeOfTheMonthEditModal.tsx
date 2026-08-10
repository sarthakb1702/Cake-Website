"use client";

import { useEffect, useState } from "react";
import { useBakeOfTheMonthStore } from "@/lib/bake-of-month-store";
import { useProductsStore } from "@/lib/products-store";
import { X, Upload, Sparkles, Loader2, CheckCircle2, AlertCircle, Tag, DollarSign, FileText, Star } from "lucide-react";

interface BakeOfTheMonthEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BakeOfTheMonthEditModal({ isOpen, onClose }: BakeOfTheMonthEditModalProps) {
  const { bakeOfMonth, updateBakeOfMonth } = useBakeOfTheMonthStore();
  const { products } = useProductsStore();

  const [title, setTitle] = useState(bakeOfMonth.title);
  const [description, setDescription] = useState(bakeOfMonth.description);
  const [price, setPrice] = useState<number | "">(bakeOfMonth.price);
  const [badgeText, setBadgeText] = useState(bakeOfMonth.badgeText || "BAKE OF THE MONTH");
  const [catalogProductId, setCatalogProductId] = useState(bakeOfMonth.catalogProductId || "");
  const [h1, setH1] = useState(bakeOfMonth.highlights[0] || "100% Eggless recipe");
  const [h2, setH2] = useState(bakeOfMonth.highlights[1] || "Rich Belgian chocolate");
  const [h3, setH3] = useState(bakeOfMonth.highlights[2] || "Freshly roasted nuts");
  const [h4, setH4] = useState(bakeOfMonth.highlights[3] || "Zero artificial preservatives");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(bakeOfMonth.image);
  const [imageUrlInput, setImageUrlInput] = useState(bakeOfMonth.image);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(bakeOfMonth.title);
      setDescription(bakeOfMonth.description);
      setPrice(bakeOfMonth.price);
      setBadgeText(bakeOfMonth.badgeText || "BAKE OF THE MONTH");
      setCatalogProductId(bakeOfMonth.catalogProductId || "");
      setH1(bakeOfMonth.highlights[0] || "100% Eggless recipe");
      setH2(bakeOfMonth.highlights[1] || "Rich Belgian chocolate");
      setH3(bakeOfMonth.highlights[2] || "Freshly roasted nuts");
      setH4(bakeOfMonth.highlights[3] || "Zero artificial preservatives");
      setImagePreview(bakeOfMonth.image);
      setImageUrlInput(bakeOfMonth.image);
      setImageFile(null);
    }
  }, [isOpen, bakeOfMonth]);

  if (!isOpen) return null;

  const handleSelectCatalogItem = (productId: string) => {
    setCatalogProductId(productId);
    const found = products.find((p) => p.id === productId);
    if (found) {
      setTitle(found.name);
      setDescription(found.description || "");
      const computedPrice = found.price || found.weightOptions?.[0]?.price || found.pricePerPiece || 0;
      setPrice(computedPrice);
      if (found.image) {
        setImagePreview(found.image);
        setImageUrlInput(found.image);
      }
    }
  };

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

    const finalHighlights = [h1, h2, h3, h4].filter((h) => h.trim() !== "");
    const finalImage = imagePreview || imageUrlInput || bakeOfMonth.image;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", String(price));
      formData.append("badgeText", badgeText);
      formData.append("catalogProductId", catalogProductId);
      formData.append("highlights", JSON.stringify(finalHighlights));
      formData.append("existingImage", finalImage);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/admin/bake-of-the-month", {
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

      updateBakeOfMonth({
        title,
        description,
        price: Number(price),
        badgeText,
        catalogProductId,
        highlights: finalHighlights,
        image: updatedImageUrl,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Error updating Bake of the Month:", err);
      updateBakeOfMonth({
        title,
        description,
        price: Number(price),
        badgeText,
        catalogProductId,
        highlights: finalHighlights,
        image: finalImage,
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
              Edit Bake of the Month
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
            <span>Bake of the Month updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Select Catalog Item */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-[#E86A7A]" /> Select Catalog Item (Optional Pre-fill)
            </label>
            <select
              value={catalogProductId}
              onChange={(e) => handleSelectCatalogItem(e.target.value)}
              className="w-full text-xs font-bold border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
            >
              <option value="">-- Custom Bake of the Month --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price || p.weightOptions?.[0]?.price || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Section Badge Text & Title */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#E86A7A]" /> Badge Text
              </label>
              <input
                type="text"
                required
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. BAKE OF THE MONTH"
                className="w-full text-xs font-bold border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-[#E86A7A]" /> Price (₹)
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 500"
                className="w-full text-xs font-bold border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
              Featured Bake Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Belgian Dark Chocolate Truffle"
              className="w-full text-sm font-bold border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#E86A7A]" /> Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rich, smooth 100% eggless Belgian chocolate..."
              className="w-full text-xs border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A] leading-relaxed"
            />
          </div>

          {/* Highlights / Bullets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
              Feature Highlights / Badges (Up to 4)
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={h1}
                onChange={(e) => setH1(e.target.value)}
                placeholder="Highlight 1 (e.g. 100% Eggless recipe)"
                className="w-full text-xs border border-border rounded-xl p-2.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
              <input
                type="text"
                value={h2}
                onChange={(e) => setH2(e.target.value)}
                placeholder="Highlight 2 (e.g. Rich Belgian chocolate)"
                className="w-full text-xs border border-border rounded-xl p-2.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
              <input
                type="text"
                value={h3}
                onChange={(e) => setH3(e.target.value)}
                placeholder="Highlight 3 (e.g. Freshly roasted nuts)"
                className="w-full text-xs border border-border rounded-xl p-2.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
              <input
                type="text"
                value={h4}
                onChange={(e) => setH4(e.target.value)}
                placeholder="Highlight 4 (e.g. Zero artificial preservatives)"
                className="w-full text-xs border border-border rounded-xl p-2.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
            </div>
          </div>

          {/* Image Photo Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
              Featured Image Photo
            </label>

            <div className="grid gap-4 sm:grid-cols-3 items-center">
              <div className="h-32 w-full rounded-2xl overflow-hidden border border-border bg-cream flex items-center justify-center relative shadow-soft">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <label className="flex items-center justify-center gap-2 h-16 border-2 border-dashed border-[#E86A7A]/40 rounded-2xl bg-blush/30 hover:bg-blush/60 transition-colors cursor-pointer p-3 text-center">
                  <Upload className="h-5 w-5 text-[#E86A7A]" />
                  <span className="text-xs font-bold text-chocolate">
                    {imageFile ? imageFile.name : "Upload new photo to Cloudinary"}
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
                  <span>Saving Changes...</span>
                </>
              ) : (
                "Save & Publish"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
