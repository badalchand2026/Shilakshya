
"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";

function UserDashboardContent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-[#F1F4F8]">

      <header className="bg-[#0B2347] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold">
            SHILAKSHYA
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
            User Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#0B2347]">
            Welcome, {user?.fullName || user?.email}
          </h2>

          <p className="mt-3 text-gray-600">
            You have successfully logged in to your account.
          </p>

          <div className="mt-8 rounded-lg bg-[#F1F4F8] p-5">
            <p className="text-sm text-gray-500">
              Account email
            </p>

            <p className="mt-1 font-semibold text-[#0B2347]">
              {user?.email}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Account role
            </p>

            <p className="mt-1 font-semibold text-[#0B2347]">
              {user?.role}
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}

export default function UserDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}
