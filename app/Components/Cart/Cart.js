"use client";
import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  Shield,
  Package,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  formatMoney,
  FREE_SHIPPING_PKR_THRESHOLD,
  FLAT_SHIPPING_PKR,
} from "../../lib/formatProductPrice";

const CartSidebar = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  } = useCart();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const subtotal = getCartTotal();
  const shipping =
    subtotal >= FREE_SHIPPING_PKR_THRESHOLD ? 0 : FLAT_SHIPPING_PKR;
  const tax = 0;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isCartOpen, closeCart]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  if (!isClient) return null;
  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar with flex column layout */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px] bg-gradient-to-b from-stone-50 to-white shadow-lg z-[1002] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-stone-700" size={22} />
            <h2 className="text-xl md:text-2xl font-bold text-stone-800">
              Your Cart
            </h2>
            <span className="px-2 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-full border border-stone-200">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="text-stone-600" size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingBag className="text-stone-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-stone-800 mb-2">
                Your cart is empty
              </h3>
              <p className="text-stone-600 mb-6">
                Add beautiful pieces to your cart to get started!
              </p>
              <button
                onClick={closeCart}
                aria-label="Close cart and continue shopping"
                className="px-6 py-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all font-medium border border-stone-900"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-4 pb-24">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-xl border border-stone-200"
                >
                  {/* Product Image */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-stone-50 to-amber-50 flex-shrink-0 border border-stone-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 64px, 80px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-2xl md:text-3xl text-stone-300">
                          🌸
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-stone-800 truncate">
                          {item.name}
                        </h3>
                        {(item.color || item.size) && (
                          <p className="text-sm text-stone-600 truncate">
                            {item.color && `${item.color}`}
                            {item.color && item.size && " • "}
                            {item.size && `${item.size}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="p-1 hover:bg-stone-50 rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 className="text-stone-400" size={16} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-stone-300 rounded-full">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="p-1 md:p-1.5 text-stone-600 hover:text-stone-800"
                        >
                          <Minus size={14} className="md:size-[16px]" aria-hidden="true" />
                        </button>
                        <span className="px-3 md:px-4 text-stone-800 font-medium text-sm md:text-base" aria-label={`Quantity: ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                          className="p-1 md:p-1.5 text-stone-600 hover:text-stone-800"
                        >
                          <Plus size={14} className="md:size-[16px]" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-bold text-stone-700 text-sm md:text-base">
                        {formatMoney(
                          item.price * item.quantity,
                          item.currency || "PKR"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Clear Cart Button */}
              <div className="pt-4">
                <button
                  onClick={clearCart}
                  aria-label="Clear all items from cart"
                  className="w-full py-3 border-2 border-stone-300 text-stone-600 rounded-full hover:bg-stone-50 transition-colors font-medium text-sm md:text-base"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show if cart has items */}
        {cartItems.length > 0 && (
          <div className="flex-shrink-0 border-t border-stone-200 bg-white p-4 md:p-6">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-700 text-sm md:text-base">
                  Subtotal
                </span>
                <span className="font-medium text-stone-800 text-sm md:text-base">
                  {formatMoney(subtotal, "PKR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-700 text-sm md:text-base">
                  Shipping
                </span>
                <span
                  className={`font-medium text-sm md:text-base ${
                    shipping === 0 ? "text-emerald-600" : "text-stone-800"
                  }`}
                >
                  {shipping === 0
                    ? "FREE"
                    : formatMoney(shipping, "PKR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-700 text-sm md:text-base">Tax</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">
                  {tax === 0 ? "—" : formatMoney(tax, "PKR")}
                </span>
              </div>
              <div className="border-t border-stone-200 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-bold text-stone-800">
                    Total
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-stone-800">
                    {formatMoney(total, "PKR")}
                  </span>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < FREE_SHIPPING_PKR_THRESHOLD && (
                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-stone-500" size={14} />
                    <span className="text-xs md:text-sm font-medium text-stone-700">
                      {formatMoney(
                        Math.max(0, FREE_SHIPPING_PKR_THRESHOLD - subtotal),
                        "PKR"
                      )}{" "}
                      away from free shipping!
                    </span>
                  </div>
                  <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-800 rounded-full"
                      style={{
                        width: `${Math.min(100, (subtotal / FREE_SHIPPING_PKR_THRESHOLD) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full py-3 md:py-4 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all shadow-sm hover:shadow-md font-semibold flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base text-center border border-stone-900"
              >
                <CreditCard size={18} className="md:size-[20px]" aria-hidden="true" />
                <span>Proceed to Checkout</span>
                <ChevronRight size={18} className="md:size-[20px]" aria-hidden="true" />
              </Link>

              <button
                onClick={closeCart}
                aria-label="Close cart and continue shopping"
                className="w-full py-3 border-2 border-stone-300 text-stone-700 rounded-full hover:bg-stone-50 transition-colors font-medium text-sm md:text-base"
              >
                Continue Shopping
              </button>
            </div>

            {/* Security Badge */}
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-center gap-2 text-stone-600">
                <Shield className="text-emerald-500" size={14} />
                <span className="text-xs md:text-sm">
                  Secure checkout • 100% Satisfaction
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
