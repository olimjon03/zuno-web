"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "./actions";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const registering = mode === "signup";
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registering ? signup : login,
    {},
  );
  return (
    <form action={action} className="auth-form" aria-busy={pending}>
      {registering && (
        <div>
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            minLength={2}
            maxLength={40}
            autoComplete="nickname"
            placeholder="How neighbors will know you"
          />
        </div>
      )}
      <div>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={registering ? 8 : 1}
          maxLength={128}
          autoComplete={registering ? "new-password" : "current-password"}
          aria-describedby={registering ? "password-hint" : undefined}
        />
        {registering && (
          <p id="password-hint" className="auth-hint">
            Use at least 8 characters.
          </p>
        )}
      </div>
      {state.error && (
        <p role="alert" className="auth-error">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="auth-success">
          {state.message}
        </p>
      )}
      <button className="button button-primary" disabled={pending}>
        {pending ? "Please wait…" : registering ? "Create account" : "Log in"}
      </button>
      <p className="auth-switch">
        {registering ? "Already a neighbor?" : "New to ZUNO?"}{" "}
        <Link href={registering ? "/login" : "/signup"}>
          {registering ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
