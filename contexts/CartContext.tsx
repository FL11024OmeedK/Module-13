import { createContext, ReactNode, useContext, useState } from 'react';

type CartContextValue = {
  quantities: Record<number, number>;
  setActiveRestaurant: (restaurantId: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

// Tracks quantities for a single "active" restaurant at a time. Opening a
// different restaurant than the one currently active clears the quantities
// immediately, before that restaurant's screen ever renders them — there is
// no per-restaurant history kept around.
export function CartProvider({ children }: { children: ReactNode }) {
  const [activeRestaurantId, setActiveRestaurantId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const setActiveRestaurant = (restaurantId: number) => {
    if (restaurantId !== activeRestaurantId) {
      setActiveRestaurantId(restaurantId);
      setQuantities({});
    }
  };

  const increment = (productId: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  };

  const decrement = (productId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] ?? 0) - 1),
    }));
  };

  return (
    <CartContext.Provider value={{ quantities, setActiveRestaurant, increment, decrement }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
