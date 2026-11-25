
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/features/auth/auth-api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      await forgotPassword(email.trim());

      router.push(
        `/reset-password?email=${encodeURIComponent(email.trim())}`
      );
    } catch (error) {
      setError(error.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F4F8] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="text-3xl font-bold text-[#0B2347]">
          Forgot Password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Enter your registered email address. We will send
          you an OTP to reset your password.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your registered email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#D5A52E]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0B2347] px-5 py-3 font-semibold text-white hover:bg-[#16365F] disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-semibold text-[#0B2347]"
        >
          Back to Login
        </Link>

      </div>
    </main>
  );
}
