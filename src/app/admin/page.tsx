"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useProductsStore } from "@/lib/products-store";
import { AdminEditButton } from "@/components/AdminEditButton";
import { Product, CakeShape, WeightOption } from "@/types";
import { generateDefaultWeightVariants, generateDefaultShapes } from "@/lib/product-helpers";
import {
  Shield,
  PlusCircle,
  Package,
  ShoppingBag,
  Trash2,
  CheckCircle,
  Image as ImageIcon,
  Sparkles,
  Layers,
  RotateCcw,
  Mail,
} from "lucide-react";

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
  fulfillmentType?: "delivery" | "pickup";
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  orderDate?: string;
  pickupDate?: string;
  timeSlot: string;
  status: "Pending" | "Preparing" | "Ready for Pickup" | "Completed";
  createdAt?: any;
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "subscribers">(
    tabParam === "orders" || tabParam === "subscribers" ? tabParam : "products"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "orders" || tab === "subscribers" || tab === "products") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const changeTab = (tab: "products" | "orders" | "subscribers") => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  const { products, addProduct, updateProduct, deleteProduct, resetToDefault } = useProductsStore();

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Subscribers State
  const [subscribers, setSubscribers] = useState<
    { id: string; email: string; discountCode?: string; createdAt?: any }[]
  >([]);

  // Form State for Adding / Editing Product
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("cake");
  const [customCategory, setCustomCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [image, setImage] = useState("");

  const defaultCategories = ["cake", "donut", "fudge"];
  const customCategoriesInUse = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((c): c is string => Boolean(c) && !defaultCategories.includes(c.toLowerCase()))
    )
  );

  // Weight Variations
  const [enableWeight, setEnableWeight] = useState(false);
  const [weightOptions, setWeightOptions] = useState<WeightOption[]>([
    { weight: "0.5 kg", price: 500 },
    { weight: "1.0 kg", price: 950 },
  ]);

  // Shape Variations
  const [enableShape, setEnableShape] = useState(false);
  const [shapesInput, setShapesInput] = useState("Round, Heart, Square");

  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(fetchedOrders);
        setOrdersLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Could not subscribe to Firestore orders:", e);
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, "subscribers"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        setSubscribers(fetched);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Could not subscribe to Firestore subscribers:", e);
    }
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setCategory("cake");
    setCustomCategory("");
    setPrice("");
    setImage("");
    setEnableWeight(false);
    setWeightOptions([
      { weight: "0.5 kg", price: 500 },
      { weight: "1.0 kg", price: 950 },
    ]);
    setEnableShape(false);
    setShapesInput("Round, Heart, Square");
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !image) {
      alert("Please fill in Product Name, Description, and Image.");
      return;
    }

    const resolvedCategory = category === "custom"
      ? (customCategory.trim() || "General")
      : category;

    const basePriceNum = Number(price) || 0;

    const parsedShapes = enableShape
      ? shapesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const finalWeightVariants = (enableWeight && weightOptions.length > 0)
      ? weightOptions
      : generateDefaultWeightVariants(resolvedCategory, basePriceNum);

    const finalShapes = enableShape
      ? parsedShapes
      : generateDefaultShapes(resolvedCategory);

    const extractedWeights = finalWeightVariants.map((w: WeightOption) => w.weight);

    const productPayload: Partial<Product> = {
      name,
      description,
      category: resolvedCategory,
      image,
      price: finalWeightVariants[0]?.price || basePriceNum,
      isEggless: true,
      availableShapes: finalShapes as CakeShape[] | undefined,
      shapes: finalShapes as CakeShape[] | undefined,
      weightOptions: finalWeightVariants,
      weightVariants: finalWeightVariants,
      weights: extractedWeights,
    };

    if (editingId) {
      updateProduct(editingId, productPayload);
    } else {
      addProduct(productPayload as Omit<Product, "id">);
    }

    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
    resetForm();
  };

  const addWeightRow = () => {
    setWeightOptions([...weightOptions, { weight: "1.5 kg", price: 1400 }]);
  };

  const updateWeightRow = (idx: number, field: "weight" | "price", val: any) => {
    const updated = [...weightOptions];
    updated[idx] = {
      ...updated[idx],
      [field]: field === "price" ? Number(val) : val,
    };
    setWeightOptions(updated);
  };

  const removeWeightRow = (idx: number) => {
    setWeightOptions(weightOptions.filter((_, i) => i !== idx));
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "All") return true;
    return order.status === statusFilter;
  });

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  return (
    <div className="min-h-screen bg-cream p-5 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-butter/40 px-3.5 py-1 text-xs font-bold text-chocolate border border-butter">
              <Shield className="h-3.5 w-3.5 text-chocolate" />
              Shreya&apos;s Home Bakery CMS Panel
            </span>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-black text-chocolate uppercase">
              Admin Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage product uploads, weight & shape variations, live customer orders, and email subscribers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => changeTab("products")}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-rose text-white shadow-badge"
                  : "bg-card text-chocolate border border-border hover:bg-blush"
              }`}
            >
              <Package className="h-4 w-4" />
              Product Catalog ({products.length})
            </button>
            <button
              onClick={() => changeTab("orders")}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-rose text-white shadow-badge"
                  : "bg-card text-chocolate border border-border hover:bg-blush"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Live Orders ({orders.length})
            </button>
            <button
              onClick={() => changeTab("subscribers")}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "subscribers"
                  ? "bg-rose text-white shadow-badge"
                  : "bg-card text-chocolate border border-border hover:bg-blush"
              }`}
            >
              <Mail className="h-4 w-4" />
              Subscribers ({subscribers.length})
            </button>
          </div>
        </div>

        {/* Quick Management Shortcuts Bar */}
        <div className="bg-card p-4 md:p-6 rounded-3xl border border-border shadow-soft space-y-3">
          <p className="text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#E86A7A]" /> Dedicated Site Section Management Pages
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/bestsellers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E86A7A] text-white text-xs font-bold hover:bg-[#d65767] transition-all shadow-badge"
            >
              Manage Bestsellers →
            </Link>
            <Link
              href="/admin/about"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E86A7A] text-white text-xs font-bold hover:bg-[#d65767] transition-all shadow-badge"
            >
              Manage About Section →
            </Link>
            <Link
              href="/admin/reviews"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E86A7A] text-white text-xs font-bold hover:bg-[#d65767] transition-all shadow-badge"
            >
              Manage Reviews →
            </Link>
            <Link
              href="/admin/gallery"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E86A7A] text-white text-xs font-bold hover:bg-[#d65767] transition-all shadow-badge"
            >
              Manage Gallery →
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chocolate text-white text-xs font-bold hover:bg-rose transition-all shadow-badge"
            >
              Store Settings (Pickup Address) →
            </Link>
          </div>
        </div>

        {/* Tab 1: Product Uploads & Catalog Management */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add / Edit Form */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleSaveProduct}
                className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-lift space-y-5"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="font-display text-xl font-bold text-chocolate uppercase flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-rose" />
                    {editingId ? "Edit Bakery Product" : "Upload New Product"}
                  </h2>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-rose font-bold hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {formSuccess && (
                  <div className="flex items-center gap-2 rounded-2xl bg-pistachio/40 p-3 text-xs font-bold text-chocolate border border-pistachio">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Product saved successfully to live catalog!</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1">
                    Product Image (URL or Upload)
                  </label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-ink outline-none focus:ring-2 focus:ring-rose mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-cream text-xs font-bold text-chocolate cursor-pointer hover:bg-blush transition-colors">
                      <ImageIcon className="h-3.5 w-3.5 text-rose" />
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {image && (
                      <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                        Image preview ready
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1">
                    Product Title / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Belgian Dark Chocolate Truffle"
                    className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-ink outline-none focus:ring-2 focus:ring-rose"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Rich 100% eggless Belgian chocolate sponge..."
                    className="w-full rounded-2xl border border-border bg-cream p-3 text-xs text-ink outline-none focus:ring-2 focus:ring-rose"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-border bg-cream px-3 text-xs font-semibold text-chocolate outline-none focus:ring-2 focus:ring-rose"
                    >
                      <option value="cake">Cakes</option>
                      <option value="donut">Donuts</option>
                      <option value="fudge">Fudge</option>
                      {customCategoriesInUse.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                      <option value="custom">+ Add Custom Category...</option>
                    </select>
                    {category === "custom" && (
                      <input
                        type="text"
                        required
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter category (e.g. Pastries)"
                        className="mt-2 w-full h-10 rounded-2xl border border-border bg-cream px-3.5 text-xs text-ink outline-none focus:ring-2 focus:ring-rose"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate uppercase tracking-wider mb-1">
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="500"
                      className="w-full h-11 rounded-2xl border border-border bg-cream px-3.5 text-xs text-ink outline-none focus:ring-2 focus:ring-rose"
                    />
                  </div>
                </div>

                {/* Checkbox Options for Variations */}
                <div className="border-t border-border pt-4 space-y-4">
                  <h3 className="text-xs font-black text-chocolate uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-rose" />
                    Optional Variations
                  </h3>

                  {/* Weight Variations Toggle */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableWeight}
                        onChange={(e) => setEnableWeight(e.target.checked)}
                        className="h-4 w-4 rounded accent-rose"
                      />
                      <span className="text-xs font-bold text-chocolate">
                        Enable Weight Variations (e.g., 0.5kg, 1kg, 2kg)
                      </span>
                    </label>

                    {enableWeight && (
                      <div className="bg-cream p-4 rounded-2xl border border-border space-y-2.5">
                        {weightOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt.weight}
                              onChange={(e) => updateWeightRow(idx, "weight", e.target.value)}
                              placeholder="0.5 kg"
                              className="w-1/2 h-9 rounded-xl border border-border bg-card px-2.5 text-xs outline-none"
                            />
                            <input
                              type="number"
                              value={opt.price}
                              onChange={(e) => updateWeightRow(idx, "price", e.target.value)}
                              placeholder="Price ₹"
                              className="w-1/2 h-9 rounded-xl border border-border bg-card px-2.5 text-xs outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeWeightRow(idx)}
                              className="p-1.5 text-rose hover:bg-blush rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addWeightRow}
                          className="text-[11px] font-bold text-rose hover:underline"
                        >
                          + Add Weight Choice
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shape Variations Toggle */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableShape}
                        onChange={(e) => setEnableShape(e.target.checked)}
                        className="h-4 w-4 rounded accent-rose"
                      />
                      <span className="text-xs font-bold text-chocolate">
                        Enable Shape Variations (e.g. Round, Heart, Square)
                      </span>
                    </label>

                    {enableShape && (
                      <input
                        type="text"
                        value={shapesInput}
                        onChange={(e) => setShapesInput(e.target.value)}
                        placeholder="Comma separated: Round, Heart, Square"
                        className="w-full h-10 rounded-2xl border border-border bg-cream px-3.5 text-xs text-ink outline-none"
                      />
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-rose text-white font-bold rounded-full text-xs shadow-badge hover:brightness-110 transition-all cursor-pointer"
                >
                  {editingId ? "Update Product" : "Save & Publish Product"}
                </button>
              </form>
            </div>

            {/* Product List Table */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-chocolate uppercase flex items-center gap-2">
                  <Layers className="h-5 w-5 text-rose" />
                  Live Product Catalog ({products.length})
                </h2>
                <button
                  onClick={resetToDefault}
                  className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-chocolate"
                  title="Reset catalog to initial seed products"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Seed Data
                </button>
              </div>

              <div className="space-y-3">
                {products.map((p) => {
                  const displayPrice = p.price || p.weightOptions?.[0]?.price || p.pricePerPiece || 0;
                  return (
                    <div
                      key={p.id}
                      className="bg-card p-4 rounded-[2rem] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-cream rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-rose uppercase">
                            {p.category}
                          </span>
                          <h3 className="font-display font-bold text-chocolate text-sm leading-tight">
                            {p.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                          <div className="text-[11px] text-chocolate font-semibold mt-1">
                            ₹{displayPrice}{" "}
                            {p.weightOptions && p.weightOptions.length > 0 && (
                              <span className="text-muted-foreground font-normal">
                                ({p.weightOptions.length} weights)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AdminEditButton
                          href={`/admin/products/${p.id}/edit`}
                          label="Edit Page"
                          className="px-3.5 py-1.5 text-xs font-bold"
                        />
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-rose hover:bg-blush transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Customer Orders Management */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-[2rem] border border-border shadow-soft">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</p>
                <p className="font-display text-3xl font-black text-chocolate mt-1">{orders.length}</p>
              </div>
              <div className="bg-card p-6 rounded-[2rem] border border-border shadow-soft">
                <p className="text-xs font-bold text-butter uppercase tracking-wider">Pending Orders</p>
                <p className="font-display text-3xl font-black text-chocolate mt-1">{pendingCount}</p>
              </div>
              <div className="bg-card p-6 rounded-[2rem] border border-border shadow-soft">
                <p className="text-xs font-bold text-rose uppercase tracking-wider">Total Revenue</p>
                <p className="font-display text-3xl font-black text-rose mt-1">₹{totalRevenue}</p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["All", "Pending", "Preparing", "Ready for Pickup", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === status
                      ? "bg-chocolate text-cream-white shadow-sm"
                      : "bg-card text-chocolate border border-border hover:bg-blush"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Orders Listing */}
            {ordersLoading ? (
              <div className="text-center py-12 text-sm text-chocolate">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-card rounded-[2.5rem] p-10 text-center text-sm text-muted-foreground border border-border">
                No customer orders found for status &quot;{statusFilter}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card p-6 rounded-[2.5rem] border border-border shadow-soft flex flex-col md:flex-row justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground">
                          ID: {order.id.slice(0, 8)}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full font-bold bg-blush text-chocolate">
                          {order.status}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full font-bold bg-butter/40 text-chocolate">
                          {order.fulfillmentType === "delivery" ? "Home Delivery (+₹20)" : "Store Pickup"}
                        </span>
                      </div>

                      <div>
                        <p className="font-display font-bold text-chocolate text-lg">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">Phone: {order.phoneNumber}</p>
                        {order.deliveryAddress && (
                          <p className="text-xs text-chocolate font-medium mt-1">
                            Address: {order.deliveryAddress}
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-chocolate bg-cream p-3.5 rounded-2xl border border-border space-y-1">
                        <p>
                          <strong>Order Date:</strong> {order.orderDate || order.pickupDate}
                        </p>
                        <p>
                          <strong>Time Slot:</strong> {order.timeSlot}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-chocolate">Items:</p>
                        {order.items?.map((item, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">
                            • {item.name} {item.weight ? `(${item.weight})` : ""} {item.shape ? `[${item.shape}]` : ""} x {item.quantity} - ₹{item.price * item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-start md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-border">
                      <p className="font-display text-2xl font-black text-rose">Total: ₹{order.totalAmount}</p>

                      <div className="space-y-1.5 w-full md:w-auto">
                        <label className="block text-xs font-bold text-chocolate">Update Status:</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full md:w-auto text-xs border border-border rounded-2xl p-2.5 bg-cream text-chocolate font-bold outline-none focus:ring-2 focus:ring-rose"
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
        )}

        {/* Tab 3: Discount Subscribers */}
        {activeTab === "subscribers" && (
          <div className="space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-lift">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div>
                  <h2 className="font-display text-2xl font-black text-chocolate uppercase">
                    Discount Subscribers ({subscribers.length})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer emails subscribed via the "Claim Discount" offer (WELCOME10).
                  </p>
                </div>
              </div>

              {subscribers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No email subscribers recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-chocolate">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Subscriber Email</th>
                        <th className="py-3 px-4">Claimed Code</th>
                        <th className="py-3 px-4">Date Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-cream/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold">{sub.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block bg-pistachio/50 text-chocolate px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-pistachio">
                              {sub.discountCode || "WELCOME10"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">
                            {sub.createdAt?.toDate ? sub.createdAt.toDate().toLocaleString() : "Recently"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-bold text-chocolate">Loading Admin Dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}