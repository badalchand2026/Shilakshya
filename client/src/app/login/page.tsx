import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import LoginForm from "./LoginForm";


export const metadata = { title: "Admin Login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getUser()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#E9E9E9] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-[#041E42]">Admin Login</h1>
        <p className="mt-1 mb-6 text-sm text-gray-600">Shilakshya Griha Nirman</p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}