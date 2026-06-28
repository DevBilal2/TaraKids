"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, ChevronLeft, KeyRound } from "lucide-react";
import { customerRecover } from "../lib/shopify";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = searchParams.get("email");
    if (q) setEmail(q);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      await customerRecover(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err.message?.includes("not found") || err.message?.toLowerCase().includes("no customer")
          ? "No account found with this email. Please check the address or register."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-stone-800 mb-2">
                Reset password
              </h1>
              <p className="text-stone-600">
                Enter the email for your Tara Kids account and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {sent ? (
              <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm">
                Check your inbox. If an account exists for this email, you&apos;ll receive a link to reset your password.
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        size={18}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-300 focus:border-transparent text-stone-800"
                        placeholder="your@email.com"
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
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send reset link</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-stone-500 hover:text-stone-700"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-stone-50/30 to-white flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
