"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShoppingCart } from "lucide-react";

// Standardized cart item shape used across the UI
export interface CartItem {
  // Unique cart entry id (combination of product id + options)
  cartId: string;
  // Product id reference
  id: string;
  name: string;
  image?: string;
  category?: string;
  // price per unit (number)
  price: number;
  quantity: number;
  totalPrice: number;
  selectedWeight?: string;
  selectedShape?: string;
  isBulkOfferApplied?: boolean;
}

type NewCartItem = Partial<CartItem> & { id: string; name: string; price: number };

interface CartContextType {
  cart: CartItem[];
  // Add one unit of the provided item (increments by 1 if exists)
  addToCart: (item: NewCartItem) => Promise<boolean>;
  // Decrease by one unit, remove if quantity reaches 0
  decreaseQuantity: (cartIdOrItem: string | NewCartItem | CartItem) => void;
  // Remove item completely
  deleteFromCart: (cartIdOrItem: string | NewCartItem | CartItem) => void;
  // Directly set quantity
  updateQuantityDirect: (cartId: string, newQuantity: number) => void;
  // Backwards-compatible alias
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastItem, setToastItem] = useState<{ title: string; image?: string } | null>(null);

  useEffect(() => {
    if (toastItem) {
      const timer = setTimeout(() => setToastItem(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastItem]);

  // 1. Hydrate cart state from localStorage on load
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sweetstudio_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Failed to parse cart from localStorage:", err);
    }
  }, []);

  // 2. Sync cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sweetstudio_cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, [cart]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
    [cart]
  );

  // Helper to resolve index whether caller passes a string id, cartId, or full item object
  const _resolveCartIndex = (
    prev: CartItem[],
    cartIdOrItem: string | NewCartItem | CartItem
  ) => {
    if (typeof cartIdOrItem === "string") {
      const byCartId = prev.findIndex((c) => c.cartId === cartIdOrItem);
      if (byCartId > -1) return byCartId;
      const byId = prev.findIndex((c) => c.id === cartIdOrItem);
      return byId;
    }

    const obj = cartIdOrItem as any;
    if (obj.cartId) {
      const idx = prev.findIndex((c) => c.cartId === obj.cartId);
      if (idx > -1) return idx;
    }
    if (obj.id) {
      const idx = prev.findIndex((c) => c.id === obj.id);
      if (idx > -1) return idx;
    }

    if (obj.name) {
      return prev.findIndex((c) => c.name === obj.name);
    }

    return -1;
  };

  const recalculateCart = (items: CartItem[]): CartItem[] => {
    const totalDonuts = items.reduce((sum, item) => {
      const isDonut =
        (item.category && item.category.toLowerCase() === "donut") ||
        item.name.toLowerCase().includes("donut");
      return isDonut ? sum + item.quantity : sum;
    }, 0);

    const isBulk = totalDonuts >= 6;

    return items.map((item) => {
      const isDonut =
        (item.category && item.category.toLowerCase() === "donut") ||
        item.name.toLowerCase().includes("donut");

      if (isDonut) {
        const unit = isBulk ? 50 : 70;
        return {
          ...item,
          price: unit,
          totalPrice: item.quantity * unit,
          isBulkOfferApplied: isBulk,
        };
      }
      return item;
    });
  };

  // Add or update cart entry. Adds a single unit (increment by 1)
  const addToCart = async (newItem: NewCartItem) => {
    const price = Number(newItem.price || 0);
    const selectedWeight = newItem.selectedWeight;
    const selectedShape = newItem.selectedShape;
    const category = newItem.category || "";

    const cartId =
      newItem.cartId || `${newItem.id}-${selectedWeight || "_"}-${selectedShape || "_"}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.cartId === cartId || c.id === newItem.id
      );

      let updatedList: CartItem[] = [];

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + 1;

        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: newQty * existing.price,
        };
        updatedList = updated;
      } else {
        const entry: CartItem = {
          cartId,
          id: newItem.id,
          name: newItem.name,
          image: newItem.image,
          category,
          price,
          quantity: 1,
          totalPrice: 1 * price,
          selectedWeight,
          selectedShape,
        };
        updatedList = [...prev, entry];
      }

      return recalculateCart(updatedList);
    });

    setToastItem({ title: newItem.name, image: newItem.image });

    return true;
  };

  const updateQuantityDirect = (cartId: string, newQuantity: number) => {
    setCart((prev) => {
      const raw = prev
        .map((item) => {
          if (item.cartId !== cartId && item.id !== cartId) return item;
          const qty = Number(newQuantity);
          if (qty <= 0) return null;

          return {
            ...item,
            quantity: qty,
            totalPrice: qty * item.price,
          } as CartItem;
        })
        .filter(Boolean) as CartItem[];

      return recalculateCart(raw);
    });
  };

  const decreaseQuantity = (cartIdOrItem: string | NewCartItem | CartItem) => {
    setCart((prev) => {
      const idx = _resolveCartIndex(prev, cartIdOrItem);
      if (idx === -1) return prev;

      const target = prev[idx];
      if (target.quantity <= 1) {
        return recalculateCart(prev.filter((_, i) => i !== idx));
      }

      const qty = target.quantity - 1;
      const updated = [...prev];
      updated[idx] = {
        ...target,
        quantity: qty,
        totalPrice: qty * target.price,
      };
      return recalculateCart(updated);
    });
  };

  const deleteFromCart = (cartIdOrItem: string | NewCartItem | CartItem) => {
    setCart((prev) => {
      const idx = _resolveCartIndex(prev, cartIdOrItem);
      if (idx === -1) return prev;
      return recalculateCart(prev.filter((_, i) => i !== idx));
    });
  };

  const removeFromCart = (cartId: string) => {
    deleteFromCart(cartId);
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseQuantity,
        deleteFromCart, // Included in value object to satisfy CartContextType
        updateQuantityDirect,
        removeFromCart,
        clearCart,
        cartTotal,
      }}
    >
      {children}
      <AnimatePresence>
        {toastItem && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 bg-card border-2 border-[#E86A7A] p-4 rounded-2xl shadow-lift"
          >
            {toastItem.image ? (
              <img
                src={toastItem.image}
                alt={toastItem.title}
                className="h-11 w-11 rounded-xl object-cover shrink-0 shadow-soft"
              />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-pistachio/40 flex items-center justify-center text-chocolate shrink-0">
                <ShoppingCart className="h-5 w-5 text-[#E86A7A]" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-chocolate">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Product added to cart successfully! 🛒</span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground truncate max-w-[210px] mt-0.5">
                {toastItem.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};