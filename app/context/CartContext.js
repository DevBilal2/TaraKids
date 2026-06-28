"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  // Load cart from localStorage on mount - defer to avoid blocking
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("taraKidsCart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          setCartItems(Array.isArray(parsed) ? parsed : []);
        }
        hasLoadedFromStorage.current = true;
      } catch (error) {
        console.error("Error loading cart:", error);
        hasLoadedFromStorage.current = true;
      }
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadCart, { timeout: 2000 });
      } else {
        setTimeout(loadCart, 0);
      }
    }
  }, []);

  // Save cart to localStorage on change - skip until we've loaded so we don't overwrite with []
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    if (cartItems.length === 0) {
      try {
        localStorage.removeItem("taraKidsCart");
      } catch (e) {}
      return;
    }

    const saveCart = () => {
      try {
        localStorage.setItem("taraKidsCart", JSON.stringify(cartItems));
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    };

    let timeoutId;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      // Use requestIdleCallback for better mobile performance
      const idleId = requestIdleCallback(saveCart, { timeout: 1000 });
      return () => cancelIdleCallback(idleId);
    } else {
      // Fallback: debounce with longer timeout for mobile
      timeoutId = setTimeout(saveCart, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems]);
  const extractShopifyId = (id) => {
    if (!id) return null;
    // Handle both formats: gid://shopify/Product/8696221532298 or just 8696221532298
    if (typeof id === "string" && id.includes("/")) {
      const parts = id.split("/");
      return parts[parts.length - 1]; // Get last part: 8696221532298
    }
    return String(id); // Return as string for consistency
  };

  const addToCart = useCallback((product, quantity = 1, color = "", size = "") => {
    console.log("Adding to cart - Product ID:", product.id);

    // Extract the numeric ID for comparison
    const productId = extractShopifyId(product.id);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) =>
          extractShopifyId(item.id) === productId &&
          item.color === color &&
          item.size === size
      );

      if (existingItem) {
        return prevItems.map((item) =>
          extractShopifyId(item.id) === productId &&
          item.color === color &&
          item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            // Store the ORIGINAL GraphQL ID
            id: product.id, // Keep original: "gid://shopify/Product/8696221532298"
            variantId: product.variantId || product.productData?.variantId || null,
            name: product.Heading || product.title || product.name,
            price:
              typeof product.price === "string"
                ? parseFloat(product.price.replace(/[^0-9.]/g, ""))
                : Number(product.price) || 0,
            currency: product.currency || "PKR",
            quantity: quantity,
            color,
            size,
            image: product.image || product.images?.[0],
            productData: product,
          },
        ];
      }
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const openCart = React.useCallback(() => setIsCartOpen(true), []);
  const closeCart = React.useCallback(() => setIsCartOpen(false), []);
  const toggleCart = React.useCallback(() => setIsCartOpen(prev => !prev), []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [cartItems, isCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, openCart, closeCart, toggleCart]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
