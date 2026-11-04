"use client";
import { Text, useT } from "@/features/language/provider";


import Link from "next/link";
import { GoogleButton } from "./google-button";
import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "./actions";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
 const t = useT();
  const registering = mode === "signup";
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registering ? signup : login,
    {},
  );
  return (
    <>
      <GoogleButton />
      <div className="auth-divider">
        <span><Text>{"or continue with email"}</Text></span>
      </div>
      <form action={action} className="auth-form" aria-busy={pending}>
        {registering && (
          <div>
            <label htmlFor="displayName"><Text>{"Display name"}</Text></label>
            <input
              id="displayName"
              name="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              minLength={2}
              maxLength={40}
              autoComplete="nickname"
              placeholder={t("How neighbors will know you")}
            />
          </div>
        )}
        <div>
          <label htmlFor="email"><Text>{"Email address"}</Text></label>
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
          <label htmlFor="password"><Text>{"Password"}</Text></label>
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
              <Text>{"Use at least 8 characters."}</Text></p>
          )}
        </div>
        {state.error && (
          <p role="alert" className="auth-error">
            <Text>{state.error}</Text>
          </p>
        )}
        {state.message && (
          <p role="status" className="auth-success">
            <Text>{state.message}</Text>
          </p>
        )}
        <button className="button button-primary" disabled={pending}>
          {pending ? <Text>{"Please wait…"}</Text> : registering ? <Text>{"Create account"}</Text> : <Text>{"Sign in"}</Text>}
        </button>
        <p className="auth-switch">
          {registering ? <Text>{"Already a neighbor?"}</Text> : <Text>{"New to ZUNO?"}</Text>}{" "}
          <Link href={registering ? "/login" : "/signup"}>
            {registering ? <Text>{"Log in"}</Text> : <Text>{"Create an account"}</Text>}
          </Link>
        </p>
      </form>
    </>
  );
}
