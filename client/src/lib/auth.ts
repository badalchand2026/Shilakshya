import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getToken } from "./session";

const API = process.env.API_URL!;

export type User = { id: number | string; name?: string; email: string; role: string };

/** Asks the backend who owns the cookie. Cached for one request. */
export const getUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.user ?? body?.data?.user ?? body?.data ?? null;
  } catch {
    return null;
  }
});

/** Use at the top of every admin page or layout. */
export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role?.toUpperCase() !== "ADMIN") redirect("/");
  return user;
}

/** fetch() for protected backend routes. Sends the token automatically. */
export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  if (!token) redirect("/login");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
    cache: "no-store",
  });
  if (res.status === 401) redirect("/login");
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`);
  return body as T;
}