"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const TIME_SLOTS = [
  { label: "10:00 AM - 12:00 PM", startHour: 10 },
  { label: "12:00 PM - 02:00 PM", startHour: 12 },
  { label: "02:00 PM - 04:00 PM", startHour: 14 },
  { label: "04:00 PM - 06:00 PM", startHour: 16 },
  { label: "06:00 PM - 08:00 PM", startHour: 18 },
];

export default function CartPage() {
  const authContext = useAuth() as any;
  const { cart = [], addToCart, decreaseQuantity, deleteFromCart, removeFromCart, clearCart } = useCart() as any;

  const currentUser = authContext.currentUser || authContext.user;

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const todayString = new Date().toISOString().split("T")[0];

  const isSlotAvailable = (startHour: number) => {
    if (!pickupDate) return true;
    if (pickupDate !== todayString) return true;
    const currentHour = new Date().getHours();
    return startHour >= currentHour + 2;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimeSlot) {
      alert("Please select an available time slot for pickup.");
      return;
    }

    if (!pickupDate) {
      alert("Please select a pickup date.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "orders"), {
        userId: currentUser ? currentUser.uid : "guest",
        customerName,
        phoneNumber,
        pickupDate,
        timeSlot: selectedTimeSlot,
        items: cart,
        totalAmount: subtotal,
        status: "Pending",
        createdAt: serverTimestamp(),
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

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center max-w-md w-full shadow-sm space-y-4">
          <div className="text-4xl">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
          <p className="text-sm text-gray-600">
            Thank you for your order. We are preparing your delicious treats!
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2.5 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">Looks like you haven't added any sweet treats yet.</p>
        <Link
          href="/cakes"
          className="px-6 py-2.5 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700 transition-colors"
        >
          Explore Cakes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Item List */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item: any, idx: number) => (
              <div
                key={item.cartId || item.id || idx}
                className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4 shadow-sm"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                    {item.image || item.imageUrl ? (
                      <img
                        src={item.image || item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🍰</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    <div className="text-xs text-gray-500 space-x-2 mt-0.5">
                      {item.weight && <span>Weight: {item.weight}</span>}
                      {item.shape && <span>• Shape: {item.shape}</span>}
                    </div>
                    <p className="text-xs font-bold text-orange-600 mt-1">₹{item.price}</p>
                  </div>
                </div>

                {/* Quantity Controls & Delete Button */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        decreaseQuantity && decreaseQuantity(item.id || item.cartId || item);
                      }}
                      className="w-7 h-7 rounded-md bg-white hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-gray-800 w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (addToCart) {
                          // pass minimal required shape for addToCart
                          addToCart({ id: item.id, name: item.name, price: item.price, cartId: item.cartId, selectedWeight: item.selectedWeight, selectedShape: item.selectedShape });
                        }
                      }}
                      className="w-7 h-7 rounded-md bg-white hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Trash / Delete Item Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFromCart && deleteFromCart(item.id || item.cartId || item);
                    }}
                    title="Remove item"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleCheckout} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-gray-900 border-b pb-3 border-gray-100">
                Order Details
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Date</label>
                <input
                  type="date"
                  required
                  min={todayString}
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                    setSelectedTimeSlot("");
                  }}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Time Slot
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
                        className={`w-full py-2 px-3 text-xs font-medium rounded-lg border text-left transition-all flex items-center justify-between ${
                          !available
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                            : isSelected
                            ? "bg-orange-50 border-orange-500 text-orange-700 font-semibold shadow-xs"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{slot.label}</span>
                        {!available ? (
                          <span className="text-[10px] text-gray-400 no-underline font-normal">Unavailable</span>
                        ) : (
                          isSelected && <span>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-50">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg text-xs hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Placing Order..." : `Confirm Order (₹${subtotal})`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}