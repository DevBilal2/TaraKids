"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import Image from "next/image";
import {
  CreditCard,
  Truck,
  Home,
  MapPin,
  Phone,
  User,
  Mail,
  CheckCircle,
  Shield,
  Banknote,
  Building,
  Package,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { checkAuthStatus } from "../lib/auth";
import { formatMoney } from "../lib/formatProductPrice";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "92",
    address: "",
    city: "",
    province: "Punjab",
    zipCode: "",
    deliveryNotes: "",
    paymentMethod: "cod",
    bankReference: "",
    agreeToTerms: false,
  });

  const subtotal = getCartTotal();
  const shipping = 200;
  const total = subtotal + shipping;

  useEffect(() => {
    const user = checkAuthStatus();
    setAuthUser(user);
    setAuthLoading(false);

    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        countryCode: user.countryCode || "92",
        address: user.address || "",
        city: user.city || "",
        province: user.province || "Punjab",
        zipCode: user.zipCode || "",
      }));
    }
  }, []);

  useEffect(() => {
    if (cartItems.length === 0 && !orderSuccess && !authLoading) {
      router.push("/");
    }
  }, [cartItems, orderSuccess, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) newErrors.email = "Please enter a valid email";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (formData.paymentMethod === "bank" && !formData.bankReference) {
      newErrors.bankReference = "Please enter your bank transfer reference";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        contact: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email.trim(),
          phone: `+${formData.countryCode}${formData.phone.replace(/\D/g, "")}`,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          province: formData.province,
          country: "Pakistan",
          zipCode: formData.zipCode,
        },
        items: cartItems.map((item) => ({
          id: item.id,
          variantId: item.variantId || null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        payment: {
          method: formData.paymentMethod,
          reference: formData.bankReference || "",
          total: total,
        },
        notes: formData.deliveryNotes,
        userId: authUser?.id || null,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authUser?.token && { Authorization: `Bearer ${authUser.token}` }),
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      const shopifyOrder = result.order;
      const orderNumber =
        shopifyOrder.order_number ||
        shopifyOrder.name ||
        `ORD-${Date.now().toString().slice(-6)}`;

      setOrderNumber(orderNumber);
      setOrderSuccess(true);
      clearCart();

      const orders = JSON.parse(
        localStorage.getItem("bloomcraft_orders") || "[]"
      );
      orders.push({
        id: orderNumber,
        shopifyId: shopifyOrder.id,
        ...orderData,
        date: new Date().toISOString(),
        status: "pending",
      });
      localStorage.setItem("bloomcraft_orders", JSON.stringify(orders));

      if (authUser) {
        const updatedUser = {
          ...authUser,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          zipCode: formData.zipCode,
        };
        localStorage.setItem("bloomcraft_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      let errorMessage = error.message;
      if (error.message.includes("401")) {
        errorMessage = "Shopify authentication failed. Please contact support.";
      } else if (error.message.includes("variant")) {
        errorMessage = "Product issue. Please try again or contact support.";
      }
      alert(`Order failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-stone-200 border-t-stone-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="mx-auto text-stone-300 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            Your cart is empty
          </h1>
          <p className="text-stone-600 mb-6">
            Add some beautiful pieces first
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all font-medium border border-stone-900"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle className="text-emerald-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-stone-600 mb-4">
            Order <strong className="text-stone-800">#{orderNumber}</strong> has
            been received
          </p>
          {String(orderNumber || "").startsWith("ORD-") ? (
            <p className="text-sm text-stone-500 mb-2">
              (This order has been recorded in our system)
            </p>
          ) : (
            <p className="text-sm text-stone-500 mb-2">
              Shopify Order #:{" "}
              <strong className="text-stone-700">{orderNumber || "N/A"}</strong>
            </p>
          )}

          <div className="bg-stone-50 rounded-xl p-4 mb-6 text-left border border-stone-100">
            <div className="flex items-center gap-2 mb-3">
              {formData.paymentMethod === "cod" ? (
                <>
                  <Banknote className="text-stone-600" size={18} />
                  <span className="font-medium text-stone-800">
                    Cash on Delivery
                  </span>
                </>
              ) : (
                <>
                  <Building className="text-blue-600" size={18} />
                  <span className="font-medium text-stone-800">
                    Bank Transfer
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-stone-700 mb-2">
              📞 <strong>Contact:</strong> +{formData.countryCode}{" "}
              {formData.phone}
            </p>
            <p className="text-sm text-stone-700 mb-2">
              🏠 <strong>Delivery to:</strong> {formData.address},{" "}
              {formData.city}
            </p>

            {formData.paymentMethod === "bank" && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                  <strong>Bank Transfer Instructions:</strong>
                  <br />
                  Please complete your transfer and share the reference number
                  with us via WhatsApp.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (authUser) {
                router.push("/Account");
              } else {
                router.push("/");
              }
            }}
            className="w-full py-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all font-medium border border-stone-900"
          >
            Done
          </button>

          <p className="mt-2 text-xs text-stone-500">
            {authUser ? "Going to your account..." : "Returning to home..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center border border-stone-900">
                1
              </div>
              <span className="ml-2 font-medium text-stone-700">Cart</span>
            </div>
            <div className="w-16 h-1 bg-stone-300 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center border border-stone-900">
                2
              </div>
              <span className="ml-2 font-medium text-stone-700">Details</span>
            </div>
            <div className="w-16 h-1 bg-stone-300 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-700 text-stone-700 flex items-center justify-center font-bold">
                3
              </div>
              <span className="ml-2 font-medium text-stone-700">Confirm</span>
            </div>
          </div>
        </div>

        {/* User Status Badge */}
        {authUser && (
          <div className="mb-6 max-w-4xl mx-auto">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-300">
                  <User className="text-emerald-600" size={16} />
                </div>
                <div>
                  <p className="font-medium text-emerald-800">
                    Welcome back, {authUser.firstName}!
                  </p>
                  <p className="text-xs text-emerald-600">
                    Your information has been prefilled
                  </p>
                </div>
              </div>
              <Link
                href="/Account"
                className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
              >
                My Account →
              </Link>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-stone-800 mb-2 text-center">
          Checkout
        </h1>
        <p className="text-stone-600 text-center mb-8">
          Complete your order in just a few steps
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <User size={20} />
                  Contact Information
                </h2>
                {!authUser && (
                  <Link
                    href="/login?redirect=/checkout"
                    className="text-sm text-stone-600 hover:text-stone-800 font-medium"
                  >
                    Already have an account? Login
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${
                      errors.firstName ? "border-red-300" : "border-stone-200"
                    } rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent`}
                    placeholder="Your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                    placeholder="Your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent ${
                        errors.email ? "border-red-300" : "border-stone-200"
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <div className="relative flex-shrink-0">
                      <div className="flex items-center h-full px-3 border border-r-0 border-stone-200 rounded-l-xl bg-stone-50">
                        <span className="text-stone-800 mr-1">+</span>
                        <input
                          type="text"
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setFormData((prev) => ({
                              ...prev,
                              countryCode: value,
                            }));
                          }}
                          className="w-10 bg-transparent outline-none text-stone-800 font-medium text-center"
                          maxLength={3}
                        />
                      </div>
                    </div>
                    <div className="relative flex-1">
                      <Phone
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                        size={18}
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.phone ? "border-red-300" : "border-stone-200"
                        } rounded-r-xl rounded-l-none focus:ring-2 focus:ring-stone-300 focus:border-transparent`}
                        placeholder="300 1234567"
                      />
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Home size={20} />
                Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-2">
                    Full Address *
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-4 text-stone-400"
                      size={18}
                    />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.address ? "border-red-300" : "border-stone-200"
                      } rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent`}
                      placeholder="House #, Street, Area, Landmark"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${
                        errors.city ? "border-red-300" : "border-stone-200"
                      } rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent`}
                    >
                      <option value="">Select City</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Other">Other City</option>
                    </select>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      Province
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                    >
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Khyber Pakhtunkhwa">KPK</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                      placeholder="54000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="deliveryNotes"
                    value={formData.deliveryNotes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                    placeholder="Special instructions, gate code, best time to deliver..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Method
              </h2>

              <div className="space-y-4">
                <label className="flex items-start p-4 border-2 border-stone-200 rounded-xl hover:border-stone-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="h-4 w-4 mt-1 text-stone-800 border-stone-300 focus:ring-stone-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <Banknote className="text-amber-600 mr-2" size={18} />
                      <span className="font-medium text-stone-800">
                        Cash on Delivery
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">
                      Pay with cash when your order arrives. Our delivery
                      person will collect payment.
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 border-stone-200 rounded-xl hover:border-stone-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={formData.paymentMethod === "bank"}
                    onChange={handleChange}
                    className="h-4 w-4 mt-1 text-stone-800 border-stone-300 focus:ring-stone-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <Building className="text-blue-600 mr-2" size={18} />
                      <span className="font-medium text-stone-800">
                        Bank Transfer
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">
                      Transfer payment to our bank account and share the
                      reference.
                    </p>

                    {formData.paymentMethod === "bank" && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-stone-800 mb-2">
                          Bank Transfer Reference Number *
                        </label>
                        <input
                          type="text"
                          name="bankReference"
                          value={formData.bankReference}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border ${
                            errors.bankReference
                              ? "border-red-300"
                              : "border-stone-200"
                          } rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent`}
                          placeholder="Enter your bank transaction ID"
                        />
                        {errors.bankReference && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.bankReference}
                          </p>
                        )}
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-700">
                            <strong>Bank Details:</strong>
                            <br />
                            Bank: HBL
                            <br />
                            Account: Tara Kids
                            <br />
                            Account #: [Your Account Number]
                            <br />
                            IBAN: [Your IBAN]
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-8 shadow-sm">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Package size={20} />
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100"
                  >
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-amber-50 to-stone-100 overflow-hidden flex-shrink-0 border border-stone-200 relative">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-xl text-stone-300">🌸</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-600">
                        {item.quantity} × {formatMoney(item.price, item.currency || "PKR")}
                      </p>
                    </div>
                    <p className="font-bold text-stone-900 text-sm whitespace-nowrap">
                      {formatMoney(
                        item.price * item.quantity,
                        item.currency || "PKR"
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-700">Subtotal</span>
                  <span className="font-medium text-stone-800">
                    {formatMoney(subtotal, "PKR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Shipping</span>
                  <span className="font-medium text-stone-800">
                    {formatMoney(shipping, "PKR")}
                  </span>
                </div>
                <div className="border-t border-stone-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-stone-800">
                      Total
                    </span>
                    <span className="text-xl font-bold text-stone-800">
                      {formatMoney(total, "PKR")}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {formData.paymentMethod === "cod"
                      ? "Payable upon delivery"
                      : "Pay via bank transfer"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full mt-6 py-4 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all shadow-sm hover:shadow-md font-semibold flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed border border-stone-900"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Truck size={20} />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <Link
                href="/"
                className="block w-full mt-3 py-3 border-2 border-stone-300 text-stone-700 rounded-full hover:bg-stone-50 transition-colors font-medium text-center"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t border-stone-200">
                <div className="flex items-center justify-center gap-2 text-stone-600">
                  <Shield className="text-emerald-500" size={14} />
                  <span className="text-xs">
                    Secure checkout • 24/7 Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
