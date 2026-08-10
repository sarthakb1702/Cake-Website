"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useProductsStore } from "@/lib/products-store";
import { Product, WeightOption } from "@/types";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  DollarSign,
  Tag,
  FileText,
  Scale,
  Shapes as ShapesIcon,
  Plus,
  X,
  Trash2,
} from "lucide-react";

const STANDARD_SHAPES = ["Round", "Heart", "Square", "Tiered", "Custom"];

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { products, updateProduct } = useProductsStore();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("cake");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");

  // Weight & Price Variants State
  const [weightVariants, setWeightVariants] = useState<WeightOption[]>([
    { weight: "250g", price: 300 },
    { weight: "500g", price: 550 },
    { weight: "1kg", price: 1000 },
  ]);

  const [shapes, setShapes] = useState<string[]>(["Round", "Heart", "Square"]);
  const [customShapeInput, setCustomShapeInput] = useState("");

  useEffect(() => {
    if (products && products.length > 0) {
      const foundProduct = products.find((p) => p.id === id);
      if (foundProduct) {
        setTitle(foundProduct.name || "");
        const computedPrice =
          foundProduct.price ||
          foundProduct.weightVariants?.[0]?.price ||
          foundProduct.weightOptions?.[0]?.price ||
          foundProduct.pricePerPiece ||
          0;
        setPrice(computedPrice);
        setDescription(foundProduct.description || "");
        setCategory(foundProduct.category || "cake");
        setImagePreview(foundProduct.image || "");
        setImageUrlInput(foundProduct.image || "");

        // Pre-populate weight variants
        const extractedVariants =
          foundProduct.weightVariants ||
          foundProduct.weightOptions ||
          (foundProduct.weights ? foundProduct.weights.map((w) => ({ weight: w, price: computedPrice })) : []);

        if (extractedVariants.length > 0) {
          setWeightVariants(extractedVariants);
        } else if (foundProduct.category === "fudge") {
          setWeightVariants([
            { weight: "250g", price: 300 },
            { weight: "500g", price: 550 },
            { weight: "1kg", price: 1000 },
          ]);
        } else {
          setWeightVariants([
            { weight: "0.5 kg", price: computedPrice || 500 },
            { weight: "1.0 kg", price: Math.round((computedPrice || 500) * 1.8) },
            { weight: "1.5 kg", price: Math.round((computedPrice || 500) * 2.6) },
            { weight: "2.0 kg", price: Math.round((computedPrice || 500) * 3.4) },
          ]);
        }

        // Pre-populate shapes
        const extractedShapes =
          foundProduct.shapes ||
          foundProduct.availableShapes ||
          [];
        if (extractedShapes.length > 0) {
          setShapes(extractedShapes);
        } else if (foundProduct.category === "cake") {
          setShapes(["Round", "Heart", "Square"]);
        } else {
          setShapes([]);
        }
      }
    }
  }, [id, products]);

  const addWeightVariantRow = (w: string = "", p: number = 0) => {
    setWeightVariants([...weightVariants, { weight: w, price: p }]);
  };

  const updateWeightVariantRow = (idx: number, field: "weight" | "price", val: any) => {
    const updated = [...weightVariants];
    updated[idx] = {
      ...updated[idx],
      [field]: field === "price" ? (val === "" ? 0 : Number(val)) : val,
    };
    setWeightVariants(updated);
    if (idx === 0 && field === "price" && val) {
      setPrice(Number(val));
    }
  };

  const removeWeightVariantRow = (idx: number) => {
    setWeightVariants(weightVariants.filter((_, i) => i !== idx));
  };

  const toggleShapePreset = (s: string) => {
    if (shapes.includes(s)) {
      setShapes(shapes.filter((item) => item !== s));
    } else {
      setShapes([...shapes, s]);
    }
  };

  const handleAddCustomShape = () => {
    const trimmed = customShapeInput.trim();
    if (trimmed && !shapes.includes(trimmed)) {
      setShapes([...shapes, trimmed]);
      setCustomShapeInput("");
    }
  };

  const removeShape = (sToRemove: string) => {
    setShapes(shapes.filter((s) => s !== sToRemove));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!title.trim()) {
      setErrorMessage("Please enter a product title.");
      return;
    }

    const cleanVariants = weightVariants.filter((v) => v.weight.trim() !== "");
    const basePriceNum = cleanVariants.length > 0 && cleanVariants[0].price > 0
      ? cleanVariants[0].price
      : Number(price) || 0;

    if (basePriceNum <= 0) {
      setErrorMessage("Please enter a valid price greater than 0 or set a weight variant price.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const finalImage =
      imagePreview ||
      imageUrlInput ||
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700";

    const extractedWeightsList = cleanVariants.map((v) => v.weight);

    try {
      // 1. Direct Firestore Sync to /products/{productId}
      try {
        const productDocRef = doc(db, "products", id);
        await setDoc(
          productDocRef,
          {
            name: title,
            title,
            price: basePriceNum,
            description,
            category,
            image: finalImage,
            weights: extractedWeightsList,
            shapes,
            weightVariants: cleanVariants,
            weightOptions: cleanVariants,
            availableShapes: shapes,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fsErr) {
        console.warn("Direct Firestore update warning:", fsErr);
      }

      // 2. Send multipart form data to API route
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", String(basePriceNum));
      formData.append("description", description);
      formData.append("category", category);
      formData.append("existingImage", finalImage);
      formData.append("weights", JSON.stringify(extractedWeightsList));
      formData.append("shapes", JSON.stringify(shapes));
      formData.append("weightVariants", JSON.stringify(cleanVariants));
      formData.append("weightOptions", JSON.stringify(cleanVariants));
      formData.append("availableShapes", JSON.stringify(shapes));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`/api/admin/products/${id}`, {
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

      // 3. Update local product store for instant client re-renders
      updateProduct(id, {
        name: title,
        price: basePriceNum,
        description: description,
        category: category,
        image: updatedImageUrl,
        weights: extractedWeightsList,
        shapes: shapes,
        weightVariants: cleanVariants,
        weightOptions: cleanVariants,
        availableShapes: shapes,
      });

      setSuccessMessage("Product and weight variant pricing updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating product:", err);
      // Fallback local store update
      updateProduct(id, {
        name: title,
        price: basePriceNum,
        description: description,
        category: category,
        image: finalImage,
        weights: extractedWeightsList,
        shapes: shapes,
        weightVariants: cleanVariants,
        weightOptions: cleanVariants,
        availableShapes: shapes,
      });
      setSuccessMessage("Product options updated locally! Redirecting...");
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 md:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-bold text-chocolate border border-border hover:bg-blush transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Link>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Product Editor • ID: {id}
          </span>
        </div>

        {/* Form Container */}
        <div className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-lift space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-butter/40 px-3.5 py-1 text-xs font-bold text-chocolate border border-butter">
              <Sparkles className="h-3.5 w-3.5 text-chocolate" />
              Edit Bake Details
            </span>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-black text-chocolate uppercase">
              Update Product & Variations
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Configure product details, photo, base pricing, and custom weight/shape variant options.
            </p>
          </div>

          {/* Feedback Banners */}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-pistachio/50 p-4 text-xs font-bold text-chocolate border border-pistachio">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-chocolate" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload & Live Preview Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider">
                Product Image (Upload New Photo or Image URL)
              </label>

              <div className="grid gap-6 md:grid-cols-3 items-center">
                {/* Image Preview Box */}
                <div className="h-44 w-full md:w-44 rounded-3xl overflow-hidden border border-border bg-cream flex items-center justify-center relative shadow-soft">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-1 text-chocolate/40" />
                      <span className="text-[10px] font-bold">No Image Selected</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 bg-chocolate/80 text-cream-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Preview
                  </span>
                </div>

                {/* Upload Controls */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-rose/40 rounded-3xl bg-blush/30 hover:bg-blush/60 transition-colors cursor-pointer p-4 text-center">
                      <Upload className="h-6 w-6 text-rose mb-1" />
                      <span className="text-xs font-bold text-chocolate">
                        {imageFile ? imageFile.name : "Click to select a new image file"}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        Supports JPG, PNG, WEBP (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Or specify Image URL directly:
                    </span>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs border border-border rounded-2xl p-3 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-rose"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Title / Name Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-rose" /> Product Title / Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Velvet Bloom Cake"
                className="w-full text-sm font-bold border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-rose"
              />
            </div>

            {/* Price & Category Fields */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-rose" /> Base Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="w-full text-sm font-bold border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-rose"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-rose" /> Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm font-bold border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-rose"
                >
                  <option value="cake">Cake</option>
                  <option value="donut">Donut</option>
                  <option value="fudge">Fudge</option>
                  <option value="cupcake">Cupcake</option>
                  <option value="pastry">Pastry</option>
                </select>
              </div>
            </div>

            {/* Weight & Price Variants Manager */}
            <div className="space-y-4 bg-cream p-5 md:p-6 rounded-3xl border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-2">
                    <Scale className="h-4 w-4 text-rose" />
                    Weight & Price Variants
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Define specific prices for each weight (e.g. 250g = ₹300, 500g = ₹550, 1kg = ₹1000)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addWeightVariantRow("", 0)}
                  className="px-3.5 py-1.5 bg-chocolate text-white text-xs font-bold rounded-full hover:bg-rose transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Weight Variant
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Quick Presets:
                </span>
                {[
                  { w: "250g", p: 300 },
                  { w: "500g", p: 550 },
                  { w: "1kg", p: 1000 },
                  { w: "0.5 kg", p: 500 },
                  { w: "1 kg", p: 900 },
                ].map((preset) => (
                  <button
                    key={preset.w}
                    type="button"
                    onClick={() => addWeightVariantRow(preset.w, preset.p)}
                    className="px-2.5 py-1 bg-card text-chocolate text-[11px] font-semibold border border-border rounded-full hover:bg-blush transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3 text-rose" />
                    {preset.w} (₹{preset.p})
                  </button>
                ))}
              </div>

              {/* Variant Rows */}
              <div className="space-y-2 pt-2">
                {weightVariants.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <p className="text-xs text-muted-foreground font-medium">No weight variants added yet.</p>
                    <button
                      type="button"
                      onClick={() => addWeightVariantRow("250g", 300)}
                      className="mt-2 text-xs font-bold text-rose hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add First Variant
                    </button>
                  </div>
                ) : (
                  weightVariants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border shadow-soft"
                    >
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          Weight Label #{idx + 1}
                        </label>
                        <input
                          type="text"
                          required
                          value={variant.weight}
                          onChange={(e) => updateWeightVariantRow(idx, "weight", e.target.value)}
                          placeholder="e.g. 250g, 500g, 1kg"
                          className="w-full text-xs font-bold border border-border rounded-xl p-2.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-rose"
                        />
                      </div>

                      <div className="w-32 md:w-40">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={variant.price || ""}
                          onChange={(e) => updateWeightVariantRow(idx, "price", e.target.value)}
                          placeholder="e.g. 300"
                          className="w-full text-xs font-bold border border-border rounded-xl p-2.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-rose"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => removeWeightVariantRow(idx)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                          title="Remove variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dynamic Shape Options Selector */}
            <div className="space-y-3 bg-cream p-5 rounded-3xl border border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-2">
                  <ShapesIcon className="h-4 w-4 text-rose" />
                  Shape Options (Variations)
                </label>
                <span className="text-[10px] text-muted-foreground">
                  Select standard shapes or add custom shapes
                </span>
              </div>

              {/* Standard Shape Checkboxes / Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {STANDARD_SHAPES.map((s) => {
                  const isSelected = shapes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleShapePreset(s)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-rose text-white shadow-badge"
                          : "bg-card text-chocolate border border-border hover:bg-blush"
                      }`}
                    >
                      <span>{s}</span>
                      {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3 opacity-60" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Shape Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customShapeInput}
                  onChange={(e) => setCustomShapeInput(e.target.value)}
                  placeholder="Add custom shape (e.g. Star, Numeric 1, Hexagon)..."
                  className="flex-1 text-xs border border-border rounded-xl p-2.5 bg-card text-chocolate outline-none focus:ring-2 focus:ring-rose"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomShape();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomShape}
                  className="px-4 py-2.5 bg-chocolate text-white text-xs font-bold rounded-xl hover:bg-rose transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Shape
                </button>
              </div>

              {/* Active Selected Shapes Chips List */}
              {shapes.length > 0 && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Active Product Shapes ({shapes.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {shapes.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-xs font-bold text-chocolate shadow-soft"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeShape(s)}
                          className="text-muted-foreground hover:text-rose p-0.5 rounded-full"
                          title={`Remove ${s}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-rose" /> Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe flavor notes, frosting, layers, and ingredients..."
                className="w-full text-xs border border-border rounded-2xl p-3.5 bg-cream text-chocolate outline-none focus:ring-2 focus:ring-rose leading-relaxed"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
              <Link
                href="/admin"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-bold text-chocolate bg-cream border border-border hover:bg-blush transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold text-white bg-rose hover:brightness-110 transition-all shadow-badge disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
