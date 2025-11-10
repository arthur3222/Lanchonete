// app/_layout.js  ou app/about/_layout.js
import { Stack } from 'expo-router';
import React from 'react';
import { CartProvider } from '../components/CartContext';

export default function Layout() {
  return (
    <CartProvider>
      <Stack
        screenOptions={{
          headerShown: false, // remove para todas as telas do Stack
        }}
      />
    </CartProvider>
  );
}
