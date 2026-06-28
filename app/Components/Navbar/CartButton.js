"use client";
import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

const CartButton = () => {
  const { getCartCount, toggleCart } = useCart();

  return (
    <button
      type="button"
      onClick={toggleCart}
      aria-label="Open shopping cart"
      className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 touch-manipulation transition-colors hover:bg-stone-100"
    >
      <ShoppingCart className="text-black" size={20} />
      {getCartCount() > 0 && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-black text-white text-xs font-bold rounded-full min-w-[18px] flex items-center justify-center">
          {getCartCount()}
        </span>
      )}
    </button>
  );
};

export default CartButton;
