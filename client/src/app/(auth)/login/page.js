
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (user.role === "USER") {
        router.replace("/user/dashboard");
      } else {
        setError("Your account has an unsupported role.");
      }
    } catch (error) {
      setError(error.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F4F8] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">

        <div className="hidden flex-col justify-between bg-[#0B2347] p-12 text-white md:flex">
          <div>
            <h1 className="text-3xl font-bold">
              SHILAKSHYA
            </h1>

            <p className="mt-2 text-sm tracking-widest text-[#D5A52E]">
              GRIHA NIRMAN PVT. LTD.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Building Your Dreams, Creating Your Future.
            </h2>

            <p className="mt-5 leading-7 text-gray-300">
              Welcome to Shilakshya Griha Nirman.
              Access your account to continue.
            </p>
          </div>

          <p className="text-sm text-gray-400">
  © 2026 Shilakshya Griha Nirman. All rights reserved.
</p>
        </div>

        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0B2347]">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Sign in to access your account.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#D5A52E] focus:ring-2 focus:ring-[#D5A52E]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 outline-none transition focus:border-[#D5A52E] focus:ring-2 focus:ring-[#D5A52E]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#0B2347]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#0B2347] hover:text-[#D5A52E]"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#0B2347] px-5 py-3 font-semibold text-white transition hover:bg-[#16365F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            <p className="mt-7 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#0B2347] hover:text-[#D5A52E]"
              >
                Register
              </Link>
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}
