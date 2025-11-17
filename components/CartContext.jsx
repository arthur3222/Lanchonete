import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [carts, setCarts] = useState({ sesc: [], senac: [] });

  const addToCart = (store, product) => {
    const key = store === 'senac' ? 'senac' : 'sesc';
    
    setCarts(prev => {
      const currentCart = prev[key];
      
      // Buscar produto existente pelo ID
      const productId = product.id || product.productId;
      const existingIndex = currentCart.findIndex(item => {
        const itemId = item.id || item.productId;
        return itemId && productId && itemId === productId;
      });
      
      // Quantidade a ser adicionada (padrão 1 se não especificado)
      const qtyToAdd = Number(product.quantidade || product.qtd || 1);
      
      // Se o produto já existe, incrementa pela quantidade especificada
      if (existingIndex !== -1) {
        const updatedCart = [...currentCart];
        const existingProduct = { ...updatedCart[existingIndex] };
        const currentQty = Number(existingProduct.quantidade || existingProduct.qtd || 1);
        existingProduct.quantidade = currentQty + qtyToAdd;
        delete existingProduct.qtd; // padronizar para 'quantidade'
        updatedCart[existingIndex] = existingProduct;
        return { ...prev, [key]: updatedCart };
      }
      
      // Se não existe, adiciona novo produto com a quantidade especificada
      const newProduct = { ...product, quantidade: qtyToAdd };
      delete newProduct.qtd;
      return { ...prev, [key]: [...currentCart, newProduct] };
    });
  };

  const removeFromCart = (store, index) => {
    const key = store === 'senac' ? 'senac' : 'sesc';
    setCarts(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const clearCart = (store) => {
    const key = store === 'senac' ? 'senac' : 'sesc';
    setCarts(prev => ({ ...prev, [key]: [] }));
  };

  const setCartItems = (store, items) => {
    const key = store === 'senac' ? 'senac' : 'sesc';
    setCarts(prev => ({ ...prev, [key]: items }));
  };

  return (
    <CartContext.Provider value={{ carts, addToCart, removeFromCart, clearCart, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
