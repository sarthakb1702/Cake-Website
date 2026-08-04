"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Link from "next/link";

export default function OrdersPage() {
  const authContext = useAuth() as any;
  const { addToCart } = useCart();
  const currentUser = authContext?.currentUser || authContext?.user;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const orderList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(orderList);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [currentUser]);

  const handleReorder = (items: any[]) => {
    items.forEach((item) => {
      addToCart(item);
    });
    alert("Items re-added to your cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6 text-xs text-[#6E5448]">
        Loading your order history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2C1810] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-6">Your Order History</h1>

        {!currentUser ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E2D9CC] text-center space-y-4">
            <p className="text-xs text-[#6E5448]">Please log in to view your current and past orders.</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-[#EA580C] text-white text-xs font-bold rounded-lg"
            >
              Log In
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E2D9CC] text-center space-y-4">
            <p className="text-xs text-[#6E5448]">You haven't placed any orders yet.</p>
            <Link
              href="/catalog"
              className="inline-block px-6 py-2.5 bg-[#EA580C] text-white text-xs font-bold rounded-lg"
            >
              Browse Bakery Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-[#E2D9CC] rounded-2xl p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-mono">ORDER ID: #{order.id}</span>
                    <span className="text-xs font-semibold text-[#2C1810]">
                      Pickup: {order.pickupDate} ({order.timeSlot})
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image || item.imageUrl ? (
                            <img src={item.image || item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">🍰</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C1810]">{item.name}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500">Total Paid</span>
                    <p className="text-base font-extrabold text-[#2C1810]">₹{order.totalAmount}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReorder(order.items || [])}
                    className="px-4 py-2 bg-[#2C1810] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors"
                  >
                    Reorder Items 🔄
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}