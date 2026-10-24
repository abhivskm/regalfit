"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { buttonClasses } from "../ui/Button";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="w-full max-w-sm rounded-xl bg-ivory p-8 shadow-sm ring-1 ring-line">
      <Image
        src="/images/brand/monogram-gold.png"
        alt=""
        width={74}
        height={80}
        unoptimized
        className="mx-auto h-14 w-auto"
      />
      <h1 className="mt-4 text-center font-display text-xl font-bold uppercase">Regal Fit Admin</h1>
      <p className="mt-1 text-center text-sm text-muted">Log in to update products, prices and photos.</p>

      <label htmlFor="password" className="mt-8 block text-sm font-medium">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? "password-error" : undefined}
        className="mt-2 block w-full rounded-md border border-line bg-ivory px-4 py-3 text-base"
      />
      {state.error && (
        <p id="password-error" role="alert" className="mt-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClasses("solid", "mt-6 w-full disabled:opacity-60")}>
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
