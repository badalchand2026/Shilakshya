
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { getAdminDashboard } from "@/features/auth/auth-api";

function AdminDashboardContent() {
  const { user, logout } = useAuth();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const result = await getAdminDashboard();

        setMessage(
          result.data?.dashboard?.message ||
          result.message ||
          "Admin dashboard loaded successfully."
        );
      } catch (error) {
        setError(error.message || "Unable to load dashboard.");
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-[#F1F4F8]">

      <header className="bg-[#0B2347] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold">
            SHILAKSHYA ADMIN
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-[#D5A52E] px-4 py-2 text-sm font-semibold text-[#0B2347]"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="rounded-xl bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">
            Admin Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#0B2347]">
            Welcome, {user?.fullName || user?.email}
          </h2>

          <p className="mt-3 text-gray-600">
            Your administrator account is authenticated.
          </p>

          {message && (
            <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {[
              "User Management",
              "Project Management",
              "Blog Management",
              "Gallery Management",
              "Team Management",
              "Website Settings",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 p-6"
              >
                <h3 className="font-semibold text-[#0B2347]">
                  {item}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Management section
                </p>
              </div>
            ))}

          </div>
        </div>

      </section>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
