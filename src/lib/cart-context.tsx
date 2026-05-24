import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Offer } from "./offers-data";
import { MAX_CART_QUANTITY } from "./offers-data";

export type CartItem = {
  offer: Offer;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  addItem: (offer: Offer, quantity?: number) => void;
  removeItem: (offerId: string) => void;
  updateQuantity: (offerId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("selecto_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("selecto_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (offer: Offer, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.offer.id === offer.id);
      const maxQuantity = Math.min(offer.availableQuantity ?? MAX_CART_QUANTITY, MAX_CART_QUANTITY);
      if (existing) {
        return prev.map((i) =>
          i.offer.id === offer.id ? { ...i, quantity: Math.min(i.quantity + quantity, maxQuantity) } : i,
        );
      }
      return [...prev, { offer, quantity: Math.min(quantity, maxQuantity) }];
    });
  };

  const removeItem = (offerId: string) => {
    setItems((prev) => prev.filter((i) => i.offer.id !== offerId));
  };

  const updateQuantity = (offerId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(offerId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.offer.id !== offerId) return i;
        const maxQuantity = Math.min(i.offer.availableQuantity ?? MAX_CART_QUANTITY, MAX_CART_QUANTITY);
        return { ...i, quantity: Math.min(quantity, maxQuantity) };
      }),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.offer.discountedPrice * item.quantity, 0);

  return (
    <Ctx.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
