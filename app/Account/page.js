"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Package,
  Heart,
  Settings,
  ArrowRight,
  LogOut,
  Edit,
  Check,
  X,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
} from "lucide-react";
import { checkAuthStatus, logout } from "../lib/auth";
import { getCustomerOrders, updateCustomerProfile } from "../lib/shopify";
import Link from "next/link";
import { formatMoney } from "../lib/formatProductPrice";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const authUser = checkAuthStatus();

    if (!authUser) {
      router.push("/register");
      return;
    }

    setUser(authUser);
    setEditForm({
      firstName: authUser.firstName || "",
      lastName: authUser.lastName || "",
      email: authUser.email || "",
      phone: authUser.phone || "Not provided",
    });
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (activeTab === "orders" && user?.accessToken && orders.length === 0) {
        setIsLoadingOrders(true);
        try {
          const ordersData = await getCustomerOrders(user.accessToken);
          setOrders(ordersData);
        } catch (error) {
          console.error("Failed to load orders:", error);
        } finally {
          setIsLoadingOrders(false);
        }
      }
    };

    loadOrders();
  }, [activeTab, user, orders.length]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSaveProfile = async () => {
    const updatedUser = { ...user, ...editForm };
    if (user.accessToken) {
      try {
        const phoneVal = editForm.phone === "Not provided" ? "" : (editForm.phone || "");
        await updateCustomerProfile(user.accessToken, {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: phoneVal,
        });
      } catch (err) {
        alert("Could not update profile in Shopify: " + (err.message || "Please try again."));
        return;
      }
    }
    localStorage.setItem("bloomcraft_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const getOrderStatus = (financialStatus, fulfillmentStatus) => {
    const statusMap = {
      PAID: {
        icon: CheckCircle,
        color: "text-stone-700",
        bg: "bg-stone-100",
        label: "Paid",
      },
      PENDING: {
        icon: Clock,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        label: "Pending",
      },
      AUTHORIZED: {
        icon: CheckCircle,
        color: "text-blue-600",
        bg: "bg-blue-50",
        label: "Authorized",
      },
      PARTIALLY_PAID: {
        icon: AlertCircle,
        color: "text-orange-600",
        bg: "bg-orange-50",
        label: "Partially Paid",
      },
      PARTIALLY_REFUNDED: {
        icon: AlertCircle,
        color: "text-orange-600",
        bg: "bg-orange-50",
        label: "Partially Refunded",
      },
      REFUNDED: {
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        label: "Refunded",
      },
      VOIDED: {
        icon: X,
        color: "text-gray-600",
        bg: "bg-gray-50",
        label: "Voided",
      },
    };

    const fulfillmentMap = {
      FULFILLED: {
        icon: Truck,
        color: "text-stone-700",
        bg: "bg-stone-100",
        label: "Delivered",
      },
      UNFULFILLED: {
        icon: Package,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        label: "Processing",
      },
      PARTIALLY_FULFILLED: {
        icon: Truck,
        color: "text-blue-600",
        bg: "bg-blue-50",
        label: "Partially Shipped",
      },
    };

    return {
      payment: statusMap[financialStatus] || {
        icon: Clock,
        color: "text-gray-600",
        bg: "bg-gray-50",
        label: financialStatus || "Unknown",
      },
      fulfillment: fulfillmentMap[fulfillmentStatus] || {
        icon: Package,
        color: "text-gray-600",
        bg: "bg-gray-50",
        label: fulfillmentStatus || "Unknown",
      },
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white flex items-center justify-center">
        <div className="text-stone-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-stone-300">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Link
                href="/allproducts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all font-medium border border-white/30"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors flex items-center gap-2 font-medium self-start md:self-center border border-white/30"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-8 shadow-sm">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors border ${
                    activeTab === "profile"
                      ? "bg-stone-50 text-stone-800 font-medium border-stone-300"
                      : "text-stone-600 hover:bg-stone-50 border-transparent"
                  }`}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors border ${
                    activeTab === "orders"
                      ? "bg-stone-50 text-stone-800 font-medium border-stone-300"
                      : "text-stone-600 hover:bg-stone-50 border-transparent"
                  }`}
                >
                  <Package size={18} />
                  <span>My Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors border ${
                    activeTab === "settings"
                      ? "bg-stone-50 text-stone-800 font-medium border-stone-300"
                      : "text-stone-600 hover:bg-stone-50 border-transparent"
                  }`}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-stone-800">
                    Personal Information
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors flex items-center gap-2 border border-stone-300"
                  >
                    {isEditing ? <X size={16} /> : <Edit size={16} />}
                    <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-3 border border-stone-200 rounded-xl bg-stone-50">
                          <p className="text-stone-800">
                            {user.firstName || "Not provided"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-3 border border-stone-200 rounded-xl bg-stone-50">
                          <p className="text-stone-800">
                            {user.lastName || "Not provided"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 flex items-center gap-2">
                          <Mail className="text-stone-500" size={16} />
                          <p className="text-stone-800">{user.email}</p>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 flex items-center gap-2">
                          <Phone className="text-stone-500" size={16} />
                          <p className="text-stone-800">{user.phone}</p>
                        </div>
                      )}
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Member Since
                      </label>
                      <div className="px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 flex items-center gap-2">
                        <Calendar className="text-stone-500" size={16} />
                        <p className="text-stone-800">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="pt-6 border-t border-stone-200">
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all flex items-center gap-2 font-medium border border-stone-900"
                      >
                        <Check size={18} />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-800 mb-6">
                  My Orders
                </h2>

                {isLoadingOrders ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-stone-700 border-t-transparent"></div>
                    <p className="mt-4 text-stone-600">
                      Loading your orders...
                    </p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(({ node: order }) => {
                      const status = getOrderStatus(
                        order.financialStatus,
                        order.fulfillmentStatus
                      );
                      const PaymentIcon = status.payment.icon;
                      const FulfillmentIcon = status.fulfillment.icon;

                      return (
                        <div
                          key={order.id}
                          className="border border-stone-200 rounded-xl p-6 hover:border-stone-300 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <h3 className="font-semibold text-stone-800">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-stone-600">
                                Placed on{" "}
                                {new Date(order.processedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div
                                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${status.payment.bg} ${status.payment.color} border`}
                              >
                                <PaymentIcon size={14} />
                                <span>{status.payment.label}</span>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${status.fulfillment.bg} ${status.fulfillment.color} border`}
                              >
                                <FulfillmentIcon size={14} />
                                <span>{status.fulfillment.label}</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-stone-200 pt-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-stone-600 mb-1">
                                  Items
                                </p>
                                <div className="space-y-1">
                                  {order.lineItems.edges.map(
                                    ({ node: item }, index) => (
                                      <p key={index} className="text-stone-800">
                                        {item.quantity} × {item.title}
                                        {item.variant?.title &&
                                          ` (${item.variant.title})`}
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-stone-600">Total</p>
                                <p className="text-xl font-bold text-stone-800">
                                  {formatMoney(
                                    order.totalPrice.amount,
                                    order.totalPrice.currencyCode || "PKR"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package
                      className="mx-auto text-stone-300 mb-4"
                      size={48}
                    />
                    <h3 className="text-xl font-semibold text-stone-800 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-stone-600 mb-6">
                      Your order history will appear here
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all font-medium border border-stone-900"
                    >
                      <span>Start Shopping</span>
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-800 mb-6">
                  Account Settings
                </h2>
                <div className="space-y-6">
                  <div className="p-4 border border-stone-200 rounded-xl">
                    <h3 className="font-medium text-stone-800 mb-3">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-stone-700">Order updates</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-stone-700 rounded border-stone-300 focus:ring-stone-300"
                          defaultChecked
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-stone-700">New arrivals</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-stone-700 rounded border-stone-300 focus:ring-stone-300"
                          defaultChecked
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-stone-700">Promotions</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-stone-700 rounded border-stone-300 focus:ring-stone-300"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border border-stone-200 rounded-xl">
                    <h3 className="font-medium text-stone-800 mb-3">
                      Password
                    </h3>
                    <p className="text-stone-600 text-sm mb-3">
                      We&apos;ll email you a secure link from our store to set a new password.
                    </p>
                    <Link
                      href={`/forgot-password?email=${encodeURIComponent(user.email || "")}`}
                      className="inline-flex px-4 py-2 border border-stone-300 text-stone-700 rounded-full hover:bg-stone-50 transition-colors font-medium"
                    >
                      Change password
                    </Link>
                  </div>

                  <div className="p-4 border border-stone-200 rounded-xl">
                    <h3 className="font-medium text-stone-800 mb-3 text-red-600">
                      Delete Account
                    </h3>
                    <p className="text-stone-600 text-sm mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
