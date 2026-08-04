"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

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

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + 1;

        let unit = existing.price || price;
        if (category === "donut") {
          unit = newQty >= 6 ? 50 : existing.price || price;
        }

        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          price: unit,
          totalPrice: newQty * unit,
        };
        return updated;
      }

      let unit = price;
      if (category === "donut") {
        unit = price;
      }

      const entry: CartItem = {
        cartId,
        id: newItem.id,
        name: newItem.name,
        image: newItem.image,
        category,
        price: unit,
        quantity: 1,
        totalPrice: 1 * unit,
        selectedWeight,
        selectedShape,
      };

      return [...prev, entry];
    });

    return true;
  };

  const updateQuantityDirect = (cartId: string, newQuantity: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartId !== cartId && item.id !== cartId) return item;
          const qty = Number(newQuantity);
          if (qty <= 0) return null;

          let unit = item.price;
          if (item.category === "donut") {
            unit = qty >= 6 ? 50 : item.price;
          }

          return {
            ...item,
            quantity: qty,
            price: unit,
            totalPrice: qty * unit,
          } as CartItem;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const decreaseQuantity = (cartIdOrItem: string | NewCartItem | CartItem) => {
    setCart((prev) => {
      const idx = _resolveCartIndex(prev, cartIdOrItem);
      if (idx === -1) return prev;

      const target = prev[idx];
      if (target.quantity <= 1) {
        return prev.filter((_, i) => i !== idx);
      }

      const qty = target.quantity - 1;
      let unit = target.price;
      if (target.category === "donut") unit = qty >= 6 ? 50 : target.price;

      const updated = [...prev];
      updated[idx] = {
        ...target,
        quantity: qty,
        price: unit,
        totalPrice: qty * unit,
      };
      return updated;
    });
  };

  const deleteFromCart = (cartIdOrItem: string | NewCartItem | CartItem) => {
    setCart((prev) => {
      const idx = _resolveCartIndex(prev, cartIdOrItem);
      if (idx === -1) return prev;
      return prev.filter((_, i) => i !== idx);
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
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};