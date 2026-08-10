"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";
import {
  Package,
  Clock,
  MapPin,
  Calendar,
  RotateCcw,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  ChevronRight,
  Receipt,
  Sparkles,
} from "lucide-react";

interface OrderItem {
  id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  selectedWeight?: string;
  weight?: string;
  selectedShape?: string;
  shape?: string;
  image?: string;
  category?: string;
}

interface Order {
  id: string;
  customerName?: string;
  phoneNumber?: string;
  fulfillmentType?: "delivery" | "pickup";
  deliveryAddress?: string;
  orderDate?: string;
  timeSlot?: string;
  items: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  discountAmount?: number;
  appliedCoupon?: string | null;
  totalAmount: number;
  status: string;
  createdAt?: any;
}

export default function OrderHistoryPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);

    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedOrders: Order[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Order, "id">),
          }));

          // Client-side sort by createdAt descending to avoid requiring custom composite index
          fetchedOrders.sort((a, b) => {
            const timeA = a.createdAt?.toDate
              ? a.createdAt.toDate().getTime()
              : new Date(a.createdAt || a.orderDate || 0).getTime();
            const timeB = b.createdAt?.toDate
              ? b.createdAt.toDate().getTime()
              : new Date(b.createdAt || b.orderDate || 0).getTime();
            return timeB - timeA;
          });

          setOrders(fetchedOrders);
          setLoadingOrders(false);
        },
        (error) => {
          console.error("Error fetching order history:", error);
          setLoadingOrders(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Firestore query error:", err);
      setLoadingOrders(false);
    }
  }, [currentUser, authLoading]);

  const handleReorder = async (order: Order) => {
    if (!order.items || order.items.length === 0) {
      toast.error("No items found in this order.");
      return;
    }

    setReorderingId(order.id);

    try {
      for (const item of order.items) {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          await addToCart({
            id: item.id || item.productId || item.name,
            name: item.name,
            price: item.price,
            selectedWeight: item.selectedWeight || item.weight,
            selectedShape: item.selectedShape || item.shape,
            image: item.image,
            category: item.category || "cake",
          });
        }
      }

      toast.success("Items added to cart!");
      router.push("/cart");
    } catch (err) {
      console.error("Failed to reorder items:", err);
      toast.error("Failed to reorder items. Please try again.");
    } finally {
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "Pending").toLowerCase();

    if (s === "completed" || s === "delivered") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          {status}
        </span>
      );
    }

    if (s === "preparing" || s === "baking") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
          {status}
        </span>
      );
    }

    if (s === "ready for pickup" || s === "out for delivery") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200">
          <Truck className="h-3.5 w-3.5 text-purple-600" />
          {status}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
        <Clock className="h-3.5 w-3.5 text-amber-600" />
        {status || "Pending"}
      </span>
    );
  };

  if (authLoading || loadingOrders) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-blush border-t-rose animate-spin mb-4" />
        <h2 className="font-display text-xl font-bold text-chocolate">Loading Your Orders...</h2>
        <p className="text-xs text-muted-foreground mt-1">Retrieving your fresh bakery order history</p>
      </div>
    );
  }

  // Auth Gate: Prompt sign in if not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="bg-card p-10 rounded-[2.5rem] border border-border text-center max-w-md w-full shadow-lift space-y-5">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blush text-rose mx-auto">
            <Receipt className="h-8 w-8" />
          </span>
          <h2 className="font-display text-2xl font-black text-chocolate uppercase">Sign In Required</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please sign in to view your order history and easily reorder your favorite eggless bakes.
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
              // Page re-renders with currentUser
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-5 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1 text-[11px] font-bold text-chocolate uppercase tracking-wider">
              <Receipt className="h-3.5 w-3.5 text-rose" /> Customer Portal
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-black text-chocolate uppercase mt-1">
              Your Order History
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track live order progress and reorder your favorite treats in one click.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose text-white text-xs font-bold rounded-full hover:scale-105 transition-transform shadow-badge self-start sm:self-auto"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Catalog
          </Link>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-card p-12 rounded-[2.5rem] border border-border text-center shadow-lift space-y-4 max-w-lg mx-auto my-12">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cream text-chocolate mx-auto border border-border">
              <Package className="h-10 w-10 text-muted-foreground" />
            </span>
            <h2 className="font-display text-2xl font-black text-chocolate uppercase">
              You Haven&apos;t Placed Any Orders Yet
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Ready to indulge? Explore our handcrafted 100% eggless cakes, donuts, and artisanal bakes.
            </p>
            <Link
              href="/catalog"
              className="inline-block mt-4 px-8 py-4 bg-rose text-white text-sm font-bold rounded-full hover:scale-105 transition-transform shadow-badge"
            >
              Browse Catalog & Order Now
            </Link>
          </div>
        ) : (
          /* Order History List */
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedId = `#ORD-${order.id.slice(0, 6).toUpperCase()}`;

              return (
                <div
                  key={order.id}
                  className="bg-card rounded-[2rem] border border-border p-6 md:p-8 shadow-soft space-y-6 transition-all hover:shadow-lift"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-base font-black text-rose">
                          {formattedId}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {order.orderDate || "Date Unavailable"}
                        {order.timeSlot && ` • Slot: ${order.timeSlot}`}
                      </p>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      disabled={reorderingId === order.id}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-chocolate text-white text-xs font-bold rounded-full hover:bg-rose transition-colors cursor-pointer shadow-badge disabled:opacity-50 self-start sm:self-auto"
                    >
                      <RotateCcw className={`h-3.5 w-3.5 ${reorderingId === order.id ? "animate-spin" : ""}`} />
                      {reorderingId === order.id ? "Adding to Cart..." : "Reorder Items"}
                    </button>
                  </div>

                  {/* Fulfillment Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-cream p-4 rounded-2xl border border-border text-xs">
                    <div className="flex items-start gap-2">
                      {order.fulfillmentType === "delivery" ? (
                        <Truck className="h-4 w-4 text-rose shrink-0 mt-0.5" />
                      ) : (
                        <Store className="h-4 w-4 text-rose shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-chocolate uppercase text-[10px] tracking-wider block">
                          Fulfillment Type
                        </span>
                        <span className="font-semibold text-chocolate">
                          {order.fulfillmentType === "delivery" ? "Home Delivery" : "Store Pickup"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-rose shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-chocolate uppercase text-[10px] tracking-wider block">
                          {order.fulfillmentType === "delivery" ? "Delivery Address" : "Pickup Location"}
                        </span>
                        <span className="font-medium text-chocolate text-xs line-clamp-1">
                          {order.deliveryAddress || "Store Pickup"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Products */}
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Items Ordered ({order.items?.length || 0})
                    </span>
                    <div className="space-y-2">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-2 border-b border-border/40 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-10 w-10 rounded-xl object-cover shrink-0 border border-border"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-blush flex items-center justify-center text-rose shrink-0 font-bold text-xs">
                                🍰
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-chocolate">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {(item.selectedWeight || item.weight) && `${item.selectedWeight || item.weight} • `}
                                {(item.selectedShape || item.shape) && `Shape: ${item.selectedShape || item.shape} • `}
                                Qty: {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-chocolate text-xs">
                            ₹{(item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Amount Payable (COD)
                    </span>
                    <span className="font-display font-black text-2xl text-rose">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}