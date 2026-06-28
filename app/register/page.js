"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flower2,
  Mail,
  User,
  Lock,
  ArrowRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { createCustomerInShopify, loginCustomer, getCustomerData } from "../lib/shopify";

const MIN_PASSWORD = 8;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shopifyError, setShopifyError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email.trim()))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < MIN_PASSWORD)
      newErrors.password = `Password must be at least ${MIN_PASSWORD} characters`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShopifyError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const nameParts = (formData.name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const customerPayload = {
        email: formData.email.trim(),
        password: formData.password,
        firstName,
        lastName,
        phone: "",
        acceptsMarketing: false,
      };

      await createCustomerInShopify(customerPayload);

      try {
        const tokenData = await loginCustomer(
          formData.email.trim(),
          formData.password
        );
        if (tokenData?.accessToken) {
          const customer = await getCustomerData(tokenData.accessToken);
          const userData = {
            id: customer.id,
            shopifyId: customer.id,
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: customer.email,
            phone: customer.phone || "",
            acceptsMarketing: customer.acceptsMarketing || false,
            createdAt: customer.createdAt,
            accessToken: tokenData.accessToken,
            tokenExpires: tokenData.expiresAt,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("bloomcraft_user", JSON.stringify(userData));
            localStorage.setItem("bloomcraft_logged_in", "true");
            localStorage.setItem("bloomcraft_token", tokenData.accessToken);
          }
          router.replace("/Account");
          return;
        }
      } catch (_) {
        /* Store may require email verification before login */
      }
      setSuccess(true);
    } catch (error) {
      if (
        error.message?.includes("already exists") ||
        error.message?.toLowerCase().includes("taken")
      ) {
        setShopifyError(
          "This email is already registered. Please sign in or use a different email."
        );
      } else if (error.message?.includes("invalid")) {
        setShopifyError("Invalid details. Please check your email and password.");
      } else {
        setShopifyError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (shopifyError) {
      setShopifyError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white">
      <div className="px-5 lg:px-8 xl:px-[8%] py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm overflow-hidden border border-stone-200">
          <div className="h-2 bg-gradient-to-r from-stone-800 to-stone-900"></div>

          {success && (
            <div className="m-6 p-4 bg-stone-50 border border-stone-200 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
                  <Check className="text-stone-700" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Account created
                  </h3>
                  <p className="text-stone-600 text-sm mt-1">
                    Check your email to activate your account if prompted, then{" "}
                    <Link href="/login" className="font-medium underline">
                      sign in
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {shopifyError && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-800">
                    Registration issue
                  </h3>
                  <p className="text-red-600 text-sm">{shopifyError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-8">
            {!success && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-stone-100 to-amber-100 rounded-full mb-4 border border-stone-200">
                    <Flower2 className="text-stone-700" size={32} />
                  </div>
                  <h1 className="text-3xl font-bold text-stone-800 mb-2">
                    Create account
                  </h1>
                  <p className="text-stone-600 text-sm">
                    Enter your name, email, and a password to get started.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                        size={18}
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.name ? "border-red-300" : "border-stone-200"
                        } rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent text-stone-800`}
                        placeholder="Your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      Email
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
                        autoComplete="email"
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.email ? "border-red-300" : "border-stone-200"
                        } rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent text-stone-800`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                        size={18}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-12 py-3 border ${
                          errors.password ? "border-red-300" : "border-stone-200"
                        } rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent text-stone-800`}
                        placeholder={`At least ${MIN_PASSWORD} characters`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all shadow-sm hover:shadow-md font-semibold flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed border border-stone-900"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create account</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-stone-600 text-sm">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-stone-800 font-medium hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
