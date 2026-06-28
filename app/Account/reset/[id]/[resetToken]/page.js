"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, KeyRound, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const MIN_PASSWORD = 8;

export default function AccountResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id;
  const resetToken = params?.resetToken;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!password || !confirm) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!customerId || !resetToken) {
      setError("This reset link is invalid. Use the link from your email or request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/customer-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: decodeURIComponent(String(customerId)),
          resetToken: decodeURIComponent(String(resetToken)),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Reset failed.");
      }

      const customerData = data.customer;
      const userData = {
        id: customerData.id,
        shopifyId: customerData.id,
        firstName: customerData.firstName || "",
        lastName: customerData.lastName || "",
        email: customerData.email,
        phone: customerData.phone || "Not provided",
        acceptsMarketing: customerData.acceptsMarketing || false,
        createdAt: customerData.createdAt,
        accessToken: data.accessToken,
        tokenExpires: data.expiresAt,
      };

      localStorage.setItem("bloomcraft_user", JSON.stringify(userData));
      localStorage.setItem("bloomcraft_logged_in", "true");
      localStorage.setItem("bloomcraft_token", data.accessToken);

      router.replace("/Account");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!customerId || !resetToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white flex items-center justify-center p-4">
        <div className="max-w-md text-center text-stone-700">
          <p className="mb-4">This password reset link is invalid or incomplete.</p>
          <Link href="/forgot-password" className="text-stone-900 font-medium underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white">
      <div className="px-5 lg:px-8 xl:px-[8%] py-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to Sign in</span>
        </Link>
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm overflow-hidden border border-stone-200">
          <div className="h-2 bg-gradient-to-r from-stone-800 to-stone-900" />
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-stone-100 to-amber-100 rounded-full mb-4 border border-stone-200">
                <KeyRound className="text-stone-700" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-stone-800 mb-2">Set new password</h1>
              <p className="text-stone-600">
                Choose a password for your Tara Kids account. You&apos;ll be signed in when you
                continue.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-800 mb-2">New password</label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent text-stone-800"
                    placeholder={`At least ${MIN_PASSWORD} characters`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-800 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent text-stone-800"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all shadow-sm hover:shadow-md font-semibold flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed border border-stone-900"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Update password & sign in</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/forgot-password" className="text-sm text-stone-500 hover:text-stone-700">
                Need a new reset link?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
