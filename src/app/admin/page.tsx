"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface OrderItem {
  name: string;
  weight?: string;
  shape?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  items: OrderItem[];
  totalAmount: number;
  pickupDate: string;
  timeSlot: string;
  status: "Pending" | "Preparing" | "Ready for Pickup" | "Completed";
  createdAt?: any;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "All") return true;
    return order.status === statusFilter;
  });

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SweetStudio Admin</h1>
          <p className="text-sm text-gray-500">Manage incoming orders and delivery schedules</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-amber-600">Pending Orders</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-emerald-600">Completed Orders</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "Pending", "Preparing", "Ready for Pickup", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-500">Loading live orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-500 border border-gray-100">
            No orders found for this status.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400">ID: {order.id.slice(0, 8)}</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        order.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : order.status === "Preparing"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Ready for Pickup"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">Phone: {order.phoneNumber}</p>
                  </div>

                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                    <p>
                      <strong>Pickup Date:</strong> {order.pickupDate}
                    </p>
                    <p>
                      <strong>Time Slot:</strong> {order.timeSlot}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-700">Items:</p>
                    {order.items?.map((item, idx) => (
                      <p key={idx} className="text-xs text-gray-600">
                        • {item.name} {item.weight ? `(${item.weight})` : ""} {item.shape ? `[${item.shape}]` : ""} x {item.quantity} - ₹{item.price * item.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between items-start md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <p className="text-lg font-bold text-gray-900">Total: ₹{order.totalAmount}</p>

                  <div className="space-y-1 w-full md:w-auto">
                    <label className="block text-xs font-medium text-gray-500">Update Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full md:w-auto text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-800 font-medium focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}