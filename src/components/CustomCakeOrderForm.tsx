"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UploadCloud, Image as ImageIcon, CheckCircle2, Cake, Sparkle, Calendar, MapPin, Truck, Store, X } from "lucide-react";
import Link from "next/link";

const WEIGHT_PRESETS = ["0.5 kg", "1 kg", "1.5 kg", "2 kg", "3 kg", "Custom"];

export function CustomCakeOrderForm({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const { currentUser, userProfile } = useAuth();

  const [description, setDescription] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("1 kg");
  const [customWeightInput, setCustomWeightInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) setCustomerName(userProfile.fullName);
      if (userProfile.phone) setPhoneNumber(userProfile.phone);
      if (userProfile.address) {
        const fullAddr = [userProfile.address, userProfile.city, userProfile.postalCode]
          .filter(Boolean)
          .join(", ");
        setDeliveryAddress(fullAddr);
      }
    } else if (currentUser?.displayName) {
      setCustomerName(currentUser.displayName);
    }
  }, [userProfile, currentUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const finalWeight = selectedWeight === "Custom"
    ? `${customWeightInput.trim() || "1"} kg`
    : selectedWeight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!description.trim()) {
      alert("Please provide a description or special instructions for your custom cake.");
      return;
    }

    if (selectedWeight === "Custom" && !customWeightInput.trim()) {
      alert("Please enter a valid custom weight.");
      return;
    }

    setIsSubmitting(true);

    try {
      const customOrderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        customerName: customerName.trim() || currentUser.displayName || "Valued Customer",
        phoneNumber: phoneNumber.trim(),
        description: description.trim(),
        weight: finalWeight,
        imageReference: imagePreview || null,
        fulfillmentType,
        deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress.trim() : "Store Pickup",
        requestedDate: requestedDate || "As soon as possible",
        status: "Pending Quote",
        category: "Custom Cake",
        createdAt: serverTimestamp(),
      };

      // Save to Firebase Firestore under "custom_orders" & "orders"
      const docRef = await addDoc(collection(db, "custom_orders"), customOrderData);
      await addDoc(collection(db, "orders"), {
        ...customOrderData,
        customOrderId: docRef.id,
        items: [{
          name: `Custom Cake (${finalWeight})`,
          price: 0,
          quantity: 1,
          image: imagePreview || "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=400",
          selectedWeight: finalWeight,
          description: description.trim(),
        }],
        totalAmount: 0, // Quote pending
      });

      setSubmittedOrder({ id: docRef.id, ...customOrderData });
    } catch (error) {
      console.error("Error submitting custom cake request:", error);
      alert("Failed to submit custom cake order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayString = new Date().toISOString().split("T")[0];

  if (submittedOrder) {
    return (
      <div className="bg-card p-8 md:p-10 rounded-[2.5rem] border border-border shadow-lift text-center max-w-xl mx-auto space-y-5">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-pistachio/40 text-chocolate mx-auto">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h2 className="font-display text-3xl font-black text-chocolate uppercase">Request Submitted!</h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
          We have received your custom cake order request. Our head pastry chef will review your design instructions and contact you via phone/email with a price quote within 2 hours.
        </p>

        <div className="rounded-2xl bg-cream p-5 border border-border text-xs text-chocolate text-left space-y-2">
          <div className="flex justify-between border-b border-border/60 pb-2">
            <span className="font-bold text-muted-foreground">Request ID</span>
            <span className="font-mono font-bold text-rose">#{submittedOrder.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-muted-foreground">Selected Weight</span>
            <span className="font-bold">{submittedOrder.weight}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-muted-foreground">Fulfillment</span>
            <span className="font-bold">{submittedOrder.fulfillmentType === "delivery" ? "Home Delivery" : "Store Pickup"}</span>
          </div>
          {submittedOrder.imageReference && (
            <div className="pt-2 border-t border-border/60">
              <span className="font-bold text-muted-foreground block mb-1.5">Uploaded Reference</span>
              <img
                src={submittedOrder.imageReference}
                alt="Uploaded design reference"
                className="h-24 w-24 object-cover rounded-xl border border-border"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/orders"
            className="px-7 py-3 bg-rose text-white text-xs font-bold rounded-full hover:scale-105 transition-all shadow-badge"
          >
            Track Request Status
          </Link>
          <Link
            href="/catalog"
            className="px-7 py-3 border border-chocolate text-chocolate text-xs font-bold rounded-full hover:bg-chocolate hover:text-white transition-all"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-lift max-w-2xl mx-auto relative">
      {isModal && onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-chocolate hover:bg-blush transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-butter/40 px-3.5 py-1 text-[11px] font-bold text-chocolate uppercase tracking-wider">
          <Cake className="h-3.5 w-3.5 text-rose" /> Custom Bakery Order
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-black text-chocolate uppercase mt-2">
          Order Your Custom Cake
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Tell us your dream cake design, pick your preferred weight, and upload reference photos!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Field 1: Description / Special Instructions */}
        <div>
          <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1.5">
            Description / Special Instructions <span className="text-rose">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe theme, piped text message, flavor choices (e.g., Red Velvet with mascarpone), color palettes, or dietary requirements..."
            className="w-full rounded-2xl border border-border bg-cream p-4 text-xs text-chocolate outline-none focus:ring-2 focus:ring-rose transition-all leading-relaxed"
          />
        </div>

        {/* Field 2: Weight Selection */}
        <div>
          <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-2">
            Select Cake Weight <span className="text-rose">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {WEIGHT_PRESETS.map((preset) => {
              const isSelected = selectedWeight === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSelectedWeight(preset)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rose text-white border-rose shadow-badge"
                      : "bg-cream border-border text-chocolate hover:bg-blush"
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {selectedWeight === "Custom" && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="25"
                required
                value={customWeightInput}
                onChange={(e) => setCustomWeightInput(e.target.value)}
                placeholder="Enter weight in kg (e.g. 2.5)"
                className="w-full h-11 rounded-2xl border border-border bg-cream px-4 text-xs text-chocolate outline-none focus:ring-2 focus:ring-rose"
              />
              <span className="text-xs font-bold text-chocolate">kg</span>
            </div>
          )}
        </div>

        {/* Field 3: Reference Image Upload */}
        <div>
          <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-2">
            Reference Image Upload (Optional)
          </label>

          {imagePreview ? (
            <div className="relative rounded-2xl border border-border p-3 bg-cream flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Reference preview"
                  className="h-16 w-16 object-cover rounded-xl border border-border"
                />
                <div>
                  <p className="text-xs font-bold text-chocolate truncate max-w-[200px]">
                    {imageFile?.name || "Reference Design Photo"}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Ready for upload</span>
                </div>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 text-rose hover:bg-blush rounded-full transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="group border-2 border-dashed border-border hover:border-rose rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-cream/50 hover:bg-cream">
              <UploadCloud className="h-8 w-8 text-rose mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-chocolate">Click or Drag photo to upload</span>
              <span className="text-[10px] text-muted-foreground mt-1">Select inspiration photos from your device gallery (PNG, JPG, WEBP)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Customer Details & Fulfillment */}
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-chocolate">
            Contact & Delivery Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-chocolate mb-1">Your Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-chocolate outline-none focus:ring-2 focus:ring-rose"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-chocolate mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-chocolate outline-none focus:ring-2 focus:ring-rose"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-chocolate mb-1.5">Fulfillment Option</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType("delivery")}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  fulfillmentType === "delivery"
                    ? "bg-rose text-white border-rose shadow-badge"
                    : "bg-cream border-border text-chocolate hover:bg-blush"
                }`}
              >
                <Truck className="h-4 w-4" /> Home Delivery
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType("pickup")}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  fulfillmentType === "pickup"
                    ? "bg-rose text-white border-rose shadow-badge"
                    : "bg-cream border-border text-chocolate hover:bg-blush"
                }`}
              >
                <Store className="h-4 w-4" /> Store Pickup
              </button>
            </div>
          </div>

          {fulfillmentType === "delivery" && (
            <div>
              <label className="block text-xs font-bold text-chocolate mb-1">Delivery Address</label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Street address, apartment, city..."
                className="w-full rounded-2xl border border-border bg-cream p-3 text-xs text-chocolate outline-none focus:ring-2 focus:ring-rose"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-chocolate mb-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-rose" /> Preferred Delivery / Pickup Date
            </label>
            <input
              type="date"
              min={todayString}
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-chocolate outline-none focus:ring-2 focus:ring-rose"
            />
          </div>
        </div>

        {/* Submit Request Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-rose text-white font-bold rounded-full text-sm shadow-badge hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "Submitting Request..." : "Submit Custom Cake Request"}
        </button>
      </form>

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          // Stay on custom cake form after auth
        }}
      />
    </div>
  );
}
