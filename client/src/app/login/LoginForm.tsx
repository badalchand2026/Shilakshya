"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

export default function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />

      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#041E42]" />
        {state.fieldErrors?.email && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-1">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#041E42]" />
        {state.fieldErrors?.password && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.password[0]}</p>}
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-lg bg-[#041E42] py-2.5 font-bold text-white transition hover:bg-[#C9A227] hover:text-[#041E42] disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}