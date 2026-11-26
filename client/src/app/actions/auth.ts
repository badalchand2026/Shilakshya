"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clearSession, setSession } from "@/lib/session";

const API = process.env.API_URL!;

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
};

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  let token: string | undefined;
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    const body = await res.json().catch(() => null);

    if (res.status === 429) return { error: "Too many attempts. Please wait a few minutes." };
    if (!res.ok) return { error: body?.message ?? "Invalid email or password" };

    token = body?.token ?? body?.data?.token ?? body?.accessToken;
  } catch {
    return { error: "Cannot reach the server. Try again." };
  }

  if (!token) return { error: "Login succeeded but no token was returned." };
  await setSession(token);

  // Only allow redirects inside /admin (blocks open-redirect tricks)
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}