
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  verifyResetOtp,
  resetPassword,
} from "@/features/auth/auth-api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const result = await verifyResetOtp(email, otp);

      setOtpVerified(true);
      setSuccess(result.message || "OTP verified successfully.");
    } catch (error) {
      setError(error.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const result = await resetPassword(
        email,
        otp,
        newPassword
      );

      setSuccess(result.message || "Password reset successful.");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setError(error.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F1F4F8] px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-[#0B2347]">
            Email is required
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please start the password reset process again.
          </p>

          <Link
            href="/forgot-password"
            className="mt-5 inline-block font-semibold text-[#0B2347]"
          >
            Go back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F4F8] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="text-3xl font-bold text-[#0B2347]">
          Reset Password
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Enter the OTP sent to {email}.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {!otpVerified ? (
          <form onSubmit={handleVerifyOtp} className="mt-7 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Six-digit OTP
              </label>

              <input
                type="text"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                inputMode="numeric"
                maxLength={6}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 tracking-[0.4em] outline-none focus:border-[#D5A52E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0B2347] px-5 py-3 font-semibold text-white hover:bg-[#16365F] disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-7 space-y-5">

            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              OTP verified. You can now create a new password.
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter your new password"
                minLength={8}
                maxLength={128}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#D5A52E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0B2347] px-5 py-3 font-semibold text-white hover:bg-[#16365F] disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>
        )}

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
