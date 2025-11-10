import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [carts, setCarts] = useState({ sesc: [], senac: [] });

  const addToCart = (store, product) => {
    const key = store === 'senac' ? 'senac' : 'sesc';
    setCarts(prev => ({ ...prev, [key]: [...prev[key], product] }));
  };

  const removeFromCart = (store, index) => {
    const key = store === 'senac' ? 'senac' : 'sesc';
    setCarts(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const clearCart = (store) => {
    const key = store === 'senac' ? 'senac' : 'sesc';
    setCarts(prev => ({ ...prev, [key]: [] }));
  };

  return (
    <CartContext.Provider value={{ carts, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
