"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, getDocs, doc, getDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthModal } from "@/components/AuthModal";
import { ShoppingBag, Truck, Store, MapPin, Calendar, Clock, Trash2, CheckCircle2, ShieldCheck, Tag, AlertCircle, Sparkles, Download, FileText } from "lucide-react";

interface CompletedOrder {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  fulfillmentType: "delivery" | "pickup";
  deliveryAddress: string;
  orderDate: string;
  timeSlot: string;
  items: Array<{
    id?: string;
    name: string;
    price: number;
    quantity: number;
    selectedWeight?: string;
    selectedShape?: string;
    weight?: string;
    image?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  appliedCoupon: string | null;
  totalAmount: number;
}

const TIME_SLOTS = [
  { label: "10:00 AM - 12:00 PM", startHour: 10 },
  { label: "12:00 PM - 02:00 PM", startHour: 12 },
  { label: "02:00 PM - 04:00 PM", startHour: 14 },
  { label: "04:00 PM - 06:00 PM", startHour: 16 },
  { label: "06:00 PM - 08:00 PM", startHour: 18 },
  { label: "08:00 PM - 10:00 PM", startHour: 20 },
];

export default function CartPage() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { cart = [], addToCart, decreaseQuantity, deleteFromCart, clearCart } = useCart();
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupAddressSetting, setPickupAddressSetting] = useState("Behind Nishigandha Hospital, Shevgaon");
  const [orderDate, setOrderDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const MIN_ORDER_AMOUNT = 200;

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Fetch Store Pickup Address configuration from Firestore
  useEffect(() => {
    async function loadStoreConfig() {
      try {
        const docRef = doc(db, "settings", "storeConfig");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.pickupAddress) {
            setPickupAddressSetting(data.pickupAddress);
          }
        }
      } catch (err) {
        console.warn("Could not load store pickup configuration:", err);
      }
    }
    loadStoreConfig();
  }, []);

  // Auto-fill user profile info
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

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const deliveryFee = fulfillmentType === "delivery" ? 20 : 0;
  const currentDiscount = Math.min(discountAmount, subtotal);
  const grandTotal = Math.max(0, subtotal - currentDiscount + deliveryFee);

  const isSubtotalBelowMin = subtotal < MIN_ORDER_AMOUNT;
  const remainingForMin = MIN_ORDER_AMOUNT - subtotal;

  const todayString = new Date().toISOString().split("T")[0];

  const isSlotAvailable = (startHour: number) => {
    if (!orderDate) return true;
    if (orderDate !== todayString) return true;
    const currentHour = new Date().getHours();
    return startHour >= currentHour + 2;
  };

  const handleApplyCoupon = async () => {
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a valid coupon code.");
      return;
    }

    if (!currentUser) {
      setCouponError("Please sign in to redeem coupon codes.");
      setAuthModalOpen(true);
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("userId", "==", currentUser.uid),
        where("appliedCoupon", "==", code)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setCouponError("You have already used this coupon code.");
        setIsApplyingCoupon(false);
        return;
      }

      let calculatedDiscount = 0;

      if (code === "WELCOME10") {
        calculatedDiscount = Math.round(subtotal * 0.1);
      } else if (code === "SPECIALOFFER") {
        calculatedDiscount = 100;
      } else if (code === "WELCOME50") {
        calculatedDiscount = 50;
      } else if (code === "BAKERY20" || code === "SHREYA20") {
        calculatedDiscount = Math.round(subtotal * 0.2);
      } else {
        setCouponError("Invalid or expired coupon code.");
        setIsApplyingCoupon(false);
        return;
      }

      setAppliedCoupon(code);
      setDiscountAmount(calculatedDiscount);
      setCouponSuccess(`Coupon code "${code}" applied successfully!`);
    } catch (err) {
      console.error("Error validating coupon:", err);
      setCouponError("Error checking coupon code. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (isSubtotalBelowMin) {
      alert(`Minimum order amount is ₹200. Add ₹${remainingForMin} more to place your order!`);
      return;
    }

    if (!orderDate) {
      alert("Please select a date for your order.");
      return;
    }

    if (!selectedTimeSlot) {
      alert("Please select a time slot.");
      return;
    }

    if (fulfillmentType === "delivery" && !deliveryAddress.trim()) {
      alert("Please provide a delivery address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send backend API request for validation & order creation
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          userEmail: currentUser.email,
          customerName,
          phoneNumber,
          fulfillmentType,
          deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : pickupAddressSetting,
          orderDate,
          timeSlot: selectedTimeSlot,
          items: cart,
          subtotal,
          deliveryFee,
          discountAmount: currentDiscount,
          appliedCoupon,
          totalAmount: grandTotal,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to place order.");
        setIsSubmitting(false);
        return;
      }

      const resData = await res.json();
      const rawDocId = resData.orderId || Math.random().toString(36).slice(2, 8);
      const formattedOrderId = `#ORD-${rawDocId.slice(0, 6).toUpperCase()}`;

      setCompletedOrder({
        orderId: formattedOrderId,
        customerName: customerName.trim() || currentUser.displayName || "Valued Customer",
        phoneNumber: phoneNumber.trim() || "N/A",
        fulfillmentType,
        deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : pickupAddressSetting,
        orderDate: orderDate || todayString,
        timeSlot: selectedTimeSlot,
        items: [...cart],
        subtotal,
        deliveryFee,
        discountAmount: currentDiscount,
        appliedCoupon,
        totalAmount: grandTotal,
      });

      if (clearCart) clearCart();
      setOrderPlaced(true);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById("invoice-pdf") || invoiceRef.current || document.getElementById("order-invoice-receipt");
      if (!element) {
        window.print();
        setIsGeneratingPDF(false);
        return;
      }

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Capture ONLY the isolated invoice-pdf receipt card container
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
      });

      const imgData = canvas.toDataURL("image/png");

      // Standard A4 Portrait PDF Dimensions: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const maxContentWidth = pdfWidth - margin * 2; // 190mm
      const maxContentHeight = pdfHeight - margin * 2; // 277mm

      let contentWidth = maxContentWidth;
      let contentHeight = (canvas.height * contentWidth) / canvas.width;

      // Scale down proportionally to ensure clean single-page A4 fit without page breaks
      if (contentHeight > maxContentHeight) {
        contentHeight = maxContentHeight;
        contentWidth = (canvas.width * contentHeight) / canvas.height;
      }

      const xPos = (pdfWidth - contentWidth) / 2;
      const yPos = margin;

      pdf.addImage(imgData, "PNG", xPos, yPos, contentWidth, contentHeight);
      pdf.save(`Invoice_${completedOrder?.orderId.replace("#", "") || "receipt"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed, launching print dialog:", err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <p className="font-display text-lg text-chocolate">Checking user authentication...</p>
      </div>
    );
  }

  // Auth Gate: If unauthenticated, show prompt modal / sign-in screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="bg-card p-10 rounded-[2.5rem] border border-border text-center max-w-md w-full shadow-lift space-y-5">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blush text-rose">
            <ShoppingBag className="h-8 w-8" />
          </span>
          <h2 className="font-display text-2xl font-black text-chocolate uppercase">Sign In Required</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please sign in to access your shopping cart and complete your order.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-4 bg-rose text-white text-sm font-bold rounded-full hover:brightness-110 transition-all cursor-pointer shadow-badge"
          >
            Sign In / Register
          </button>
          <Link
            href="/catalog"
            className="inline-block text-xs font-bold text-chocolate hover:text-rose transition-colors mt-2"
          >
            &larr; Back to Catalog
          </Link>

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={() => {
              // Reload page or stay on cart
            }}
          />
        </div>
      </div>
    );
  }

  if (orderPlaced && completedOrder) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 md:p-8">
        <style jsx global>{`
          @media print {
            header, nav, footer, .no-print {
              display: none !important;
            }
            body {
              background: #ffffff !important;
            }
            #invoice-pdf {
              visibility: visible !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 24px !important;
              box-shadow: none !important;
              border: 1px solid #e5e7eb !important;
              background: #ffffff !important;
            }
            #invoice-pdf * {
              visibility: visible !important;
            }
          }
        `}</style>

        <div className="max-w-2xl w-full space-y-6">
          {/* Header Banner - Excluded from PDF */}
          <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border text-center shadow-lift space-y-3 no-print">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-pistachio/40 text-chocolate mx-auto">
              <CheckCircle2 className="h-9 w-9 text-chocolate" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black text-chocolate uppercase">
              Order Placed Successfully!
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              Thank you for ordering with Shreya&apos;s Home Bakery! We are baking your fresh 100% eggless treats right away.
            </p>
          </div>

          {/* Itemized Printable Receipt Card - Target element for PDF */}
          <div
            id="invoice-pdf"
            ref={invoiceRef}
            className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-soft space-y-6 text-chocolate"
          >
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2">
              <div>
                <span className="text-[10px] font-black tracking-widest text-rose uppercase">
                  Shreya&apos;s Home Bakery
                </span>
                <h3 className="font-display text-2xl font-black text-chocolate uppercase">
                  Tax Invoice & Receipt
                </h3>
              </div>
              <div className="sm:text-right">
                <span className="font-mono text-sm font-black text-rose block">
                  Order ID: {completedOrder.orderId}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Date: {completedOrder.orderDate}
                </span>
              </div>
            </div>

            {/* Customer & Fulfillment Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream p-4 rounded-2xl border border-border text-xs">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Customer Information
                </p>
                <p className="font-bold text-chocolate text-sm mt-0.5">{completedOrder.customerName}</p>
                <p className="text-muted-foreground">Phone: {completedOrder.phoneNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Fulfillment & Slot
                </p>
                <p className="font-bold text-chocolate text-sm mt-0.5">
                  {completedOrder.fulfillmentType === "delivery" ? "Home Delivery" : "Store Pickup"}
                </p>
                <p className="text-muted-foreground">Slot: {completedOrder.timeSlot}</p>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-border/60">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {completedOrder.fulfillmentType === "delivery" ? "Delivery Address" : "Pickup Location"}
                </p>
                <p className="font-medium text-chocolate mt-0.5">{completedOrder.deliveryAddress}</p>
              </div>
            </div>

            {/* Itemized Cart Items Table */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-chocolate mb-3">
                Ordered Items Breakdown
              </p>
              <div className="space-y-2 border-b border-border pb-4">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                    <div>
                      <span className="font-bold text-chocolate">{item.name}</span>
                      {(item.selectedWeight || item.weight) && (
                        <span className="text-muted-foreground text-[11px] ml-1.5">
                          ({item.selectedWeight || item.weight})
                        </span>
                      )}
                      {item.selectedShape && (
                        <span className="text-muted-foreground text-[11px] ml-1">
                          [{item.selectedShape}]
                        </span>
                      )}
                      <span className="text-muted-foreground text-[11px] block sm:inline sm:ml-2">
                        Qty: {item.quantity} × ₹{item.price}
                      </span>
                    </div>
                    <span className="font-black text-chocolate text-xs">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary Calculations */}
            <div className="space-y-2 text-xs text-chocolate pt-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items Subtotal</span>
                <span className="font-bold">₹{completedOrder.subtotal}</span>
              </div>

              {completedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount ({completedOrder.appliedCoupon})</span>
                  <span>-₹{completedOrder.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Fulfillment Fee ({completedOrder.fulfillmentType === "delivery" ? "Home Delivery" : "Store Pickup"})
                </span>
                <span className="font-bold">
                  {completedOrder.deliveryFee > 0 ? `+₹${completedOrder.deliveryFee}` : "FREE"}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-chocolate pt-3 border-t border-border">
                <span>Total Amount Payable (COD)</span>
                <span className="text-rose font-display text-2xl">₹{completedOrder.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Excluded from PDF */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 no-print">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-6 py-3.5 bg-chocolate text-white text-xs font-bold rounded-full hover:bg-rose transition-colors cursor-pointer shadow-badge disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isGeneratingPDF ? "Generating PDF..." : "Download Invoice (PDF)"}
            </button>
            <Link
              href="/catalog"
              className="px-6 py-3.5 bg-rose text-white text-xs font-bold rounded-full hover:scale-105 transition-transform shadow-badge"
            >
              Back to Catalog
            </Link>
            <Link
              href="/orders"
              className="px-6 py-3.5 border border-chocolate text-chocolate text-xs font-bold rounded-full hover:bg-chocolate hover:text-white transition-all"
            >
              Track Order Status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-chocolate mb-4">
          <ShoppingBag className="h-10 w-10" />
        </span>
        <h2 className="font-display text-3xl font-black text-chocolate uppercase">Your Cart is Empty</h2>
        <p className="text-xs text-muted-foreground mt-2 mb-6">Looks like you haven&apos;t added any delicious bakes yet.</p>
        <Link
          href="/catalog"
          className="px-8 py-4 bg-rose text-white text-sm font-bold rounded-full hover:scale-105 transition-transform shadow-badge"
        >
          Explore Bakery Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-5 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="inline-block rounded-full bg-secondary px-3.5 py-1 text-[11px] font-bold tracking-wider text-chocolate uppercase">
              Checkout
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-black text-chocolate uppercase mt-1">
              Your Cart Summary
            </h1>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-rose hover:underline">
            + Add More Items
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item: any, idx: number) => (
              <div
                key={item.cartId || item.id || idx}
                className="bg-card p-5 rounded-[2rem] border border-border flex items-center justify-between gap-4 shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-cream rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-chocolate text-base">{item.name}</h3>
                    <div className="text-xs text-muted-foreground space-x-2 mt-1">
                      {item.selectedWeight && <span>Weight: {item.selectedWeight}</span>}
                      {item.selectedShape && <span>• Shape: {item.selectedShape}</span>}
                    </div>
                    {item.isBulkOfferApplied && (
                      <span className="inline-block mt-1 bg-pistachio/60 text-chocolate font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-pistachio">
                        Bulk Offer Applied: ₹50/donut (6+ offer)
                      </span>
                    )}
                    <p className="text-sm font-black text-rose mt-1.5">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-cream px-3 py-1.5 rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity && decreaseQuantity(item.cartId || item.id || item)}
                      className="h-6 w-6 rounded-full bg-card hover:bg-blush text-chocolate font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-chocolate w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart && addToCart({ id: item.id, name: item.name, price: item.price, cartId: item.cartId, selectedWeight: item.selectedWeight, selectedShape: item.selectedShape })}
                      className="h-6 w-6 rounded-full bg-card hover:bg-blush text-chocolate font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteFromCart && deleteFromCart(item.cartId || item.id || item)}
                    title="Remove item"
                    className="p-2 text-muted-foreground hover:text-rose transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-secondary/60 p-4 border border-secondary flex items-center gap-3 text-xs text-chocolate">
              <ShieldCheck className="h-5 w-5 text-chocolate shrink-0" />
              <span>100% Eggless Guarantee. All cakes prepared fresh on your scheduled fulfillment date.</span>
            </div>
          </div>

          {/* Right Column: Fulfillment & Checkout Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleCheckout} className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-lift space-y-6">
              <h2 className="font-display text-xl font-bold text-chocolate border-b border-border pb-3">
                Fulfillment & Details
              </h2>

              {/* Delivery vs Store Pickup Radio Selection */}
              <div>
                <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-2">
                  Choose Fulfillment Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType("delivery")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${fulfillmentType === "delivery"
                        ? "bg-rose text-white border-rose shadow-badge"
                        : "bg-cream text-chocolate border-border hover:bg-blush"
                      }`}
                  >
                    <Truck className="h-5 w-5 mb-1" />
                    <span>Home Delivery (+₹20)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType("pickup")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${fulfillmentType === "pickup"
                        ? "bg-rose text-white border-rose shadow-badge"
                        : "bg-cream text-chocolate border-border hover:bg-blush"
                      }`}
                  >
                    <Store className="h-5 w-5 mb-1" />
                    <span>Store Pickup (Free)</span>
                  </button>
                </div>
              </div>

              {/* Pre-filled Customer Information */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-chocolate mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-ink outline-none focus:ring-2 focus:ring-rose"
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
                    className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-ink outline-none focus:ring-2 focus:ring-rose"
                  />
                </div>

                {/* Conditional Address Field */}
                {fulfillmentType === "delivery" ? (
                  <div>
                    <label className="block text-xs font-bold text-chocolate mb-1 flex items-center justify-between">
                      <span>Delivery Address</span>
                      <span className="text-[10px] text-rose">Auto-filled from profile</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Street, Building, Flat No., City"
                      className="w-full rounded-2xl border border-border bg-cream p-3 text-xs text-ink outline-none focus:ring-2 focus:ring-rose"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-cream p-3 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4 text-rose shrink-0" />
                    <span>Pickup Address: {pickupAddressSetting}</span>
                  </div>
                )}
              </div>

              {/* Order Date & Time Slots */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-chocolate mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-rose" />
                    <span>Select Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayString}
                    value={orderDate}
                    onChange={(e) => {
                      setOrderDate(e.target.value);
                      setSelectedTimeSlot("");
                    }}
                    className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-ink outline-none focus:ring-2 focus:ring-rose"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate mb-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-rose" />
                    <span>Select Time Slot</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const available = isSlotAvailable(slot.startHour);
                      const isSelected = selectedTimeSlot === slot.label;

                      return (
                        <button
                          key={slot.label}
                          type="button"
                          disabled={!available}
                          onClick={() => available && setSelectedTimeSlot(slot.label)}
                          className={`w-full py-2.5 px-3.5 text-xs font-medium rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${!available
                              ? "bg-muted text-muted-foreground border-border cursor-not-allowed line-through opacity-60"
                              : isSelected
                                ? "bg-rose text-white border-rose font-bold shadow-sm"
                                : "bg-cream border-border text-chocolate hover:bg-blush"
                            }`}
                        >
                          <span>{slot.label}</span>
                          {!available ? (
                            <span className="text-[10px] no-underline font-normal">Passed</span>
                          ) : (
                            isSelected && <span>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Apply Coupon Code Section */}
              <div className="border-t border-border pt-4 space-y-2">
                <label className="block text-xs font-bold text-chocolate flex items-center gap-1.5 uppercase">
                  <Tag className="h-3.5 w-3.5 text-rose" />
                  <span>Apply Coupon Code</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. WELCOME10, SPECIALOFFER"
                    className="flex-1 h-10 rounded-2xl border border-border bg-cream px-3 text-xs uppercase font-bold text-chocolate outline-none focus:ring-2 focus:ring-rose"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                    className="px-5 h-10 bg-chocolate text-white text-xs font-bold rounded-2xl hover:bg-rose transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isApplyingCoupon ? "Checking..." : "Apply"}
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] font-bold text-rose flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {couponSuccess}
                  </p>
                )}
              </div>

              {/* Order Summary & Delivery Fee */}
              <div className="border-t border-border pt-4 space-y-2 text-xs text-chocolate">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items Subtotal</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>

                {currentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-₹{currentDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fulfillment Fee ({fulfillmentType === "delivery" ? "Home Delivery" : "Store Pickup"})</span>
                  <span className="font-bold">{deliveryFee > 0 ? `+₹${deliveryFee}` : "FREE"}</span>
                </div>

                <div className="flex justify-between text-base font-black text-chocolate pt-2 border-t border-border">
                  <span>Grand Total</span>
                  <span className="text-rose font-display text-xl">₹{grandTotal}</span>
                </div>
              </div>

              {/* Minimum Order Amount Warning */}
              {isSubtotalBelowMin && (
                <div className="rounded-2xl bg-rose/10 border border-rose/30 p-3.5 flex items-center gap-2.5 text-xs text-chocolate font-medium">
                  <AlertCircle className="h-5 w-5 text-rose shrink-0" />
                  <span>
                    Minimum order amount is <strong>₹200</strong>. Add <strong>₹{remainingForMin}</strong> more to place your order!
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isSubtotalBelowMin}
                className="w-full py-4 bg-rose text-white font-bold rounded-full text-sm shadow-badge hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Placing Order..."
                  : isSubtotalBelowMin
                    ? `Min Order ₹200 (Add ₹${remainingForMin} more)`
                    : `Confirm Order (₹${grandTotal})`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}