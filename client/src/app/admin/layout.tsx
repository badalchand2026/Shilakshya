import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth";

export const metadata = { robots: { index: false } };

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();   // the real security check

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-[#041E42] p-5 text-white">
        <p className="mb-8 text-lg font-bold">Shilakshya Admin</p>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 hover:bg-white/10">{l.label}</Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <span className="text-sm text-gray-600">Signed in as <strong>{user.name ?? user.email}</strong></span>
          <form action={logoutAction}>
            <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100">Log out</button>
          </form>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}