"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setErrorMessage(error.message || "Invalid login credentials");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF9E15]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Mobile-first Back to Website button */}
      <div className="w-full max-w-md mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to website
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 sm:p-8">
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo/logo.png"
                alt="Linda Home Decor"
                width={130}
                height={42}
                priority
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#FF9E15] text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Sign in to manage your website content & enquiries
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lindahomedecor.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 bg-neutral-50/50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-neutral-300 bg-neutral-50/50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9E15] focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center py-2.5 px-4 rounded-xl shadow-xs text-sm font-semibold text-white bg-[#FF9E15] hover:bg-[#e0890f] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          © {new Date().getFullYear()} Linda Home Decor. All rights reserved.
        </p>
      </div>
    </div>
  );
}
