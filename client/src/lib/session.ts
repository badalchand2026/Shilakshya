import "server-only";
import { cookies } from "next/headers";

export const COOKIE_NAME = "shl_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days. Match your JWT expiry.

export async function setSession(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getToken() {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME);
}