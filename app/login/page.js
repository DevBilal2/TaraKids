"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flower2,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import { checkAuthStatus } from "../lib/auth";
import { loginCustomer, getCustomerData } from "../lib/shopify";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (checkAuthStatus()) {
      router.replace("/Account");
      return;
    }
    setChecking(false);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const tokenData = await loginCustomer(formData.email, formData.password);
      const customerData = await getCustomerData(tokenData.accessToken);

      const userData = {
        id: customerData.id,
        shopifyId: customerData.id,
        firstName: customerData.firstName || "",
        lastName: customerData.lastName || "",
        email: customerData.email,
        phone: customerData.phone || "Not provided",
        acceptsMarketing: customerData.acceptsMarketing || false,
        createdAt: customerData.createdAt,
        accessToken: tokenData.accessToken,
        tokenExpires: tokenData.expiresAt,
      };

      localStorage.setItem("bloomcraft_user", JSON.stringify(userData));
      localStorage.setItem("bloomcraft_logged_in", "true");
      localStorage.setItem("bloomcraft_token", tokenData.accessToken);

      if (formData.rememberMe) {
        localStorage.setItem("bloomcraft_remember", "true");
      }

      setIsLoading(false);
      router.replace("/Account");
    } catch (error) {
      setIsLoading(false);

      if (
        error.message.includes("Invalid credentials") ||
        error.message.includes("incorrect") ||
        error.message.includes("unidentified")
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (
        error.message.includes("not found") ||
        error.message.includes("does not exist")
      ) {
        setError("No account found with this email. Please register first.");
      } else if (
        error.message.includes("Customer account is disabled") ||
        error.message.includes("not activated")
      ) {
        setError("Your account needs activation. Please check your email.");
      } else {
        setError(`Login failed: ${error.message}. Please try again.`);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white flex items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white">
      <div className="px-5 lg:px-8 xl:px-[8%] py-4">
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

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-stone-100 to-amber-100 rounded-full mb-4 border border-stone-200">
                <Flower2 className="text-stone-700" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-stone-800 mb-2">
                Welcome back
              </h1>
              <p className="text-stone-600">
                Sign in with your email and password
              </p>
              <p className="text-stone-500 text-sm mt-3">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-stone-900 font-medium hover:text-black underline underline-offset-2"
                >
                  Create one
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent text-stone-800"
                    placeholder="your@email.com"
                  />
                </div>
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
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent text-stone-800"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-stone-700 rounded border-stone-300 focus:ring-stone-300"
                  />
                  <span className="text-sm text-stone-700">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-stone-500 hover:text-stone-700"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                aria-label={isLoading ? "Signing in..." : "Sign in"}
                className="w-full py-4 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all shadow-sm hover:shadow-md font-semibold flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed border border-stone-900"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-stone-500">
                    New to Tara Kids?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-full hover:bg-stone-50 transition-colors font-medium"
                >
                  <span>Create account</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
