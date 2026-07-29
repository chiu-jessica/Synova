"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Atom, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create the account.");
      setSubmitting(false);
      return;
    }

    // Sign straight in with the credentials just registered, so the new
    // account lands on the dashboard rather than back at the login page.
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Atom className="text-teal mx-auto mb-4" size={28} />
          <h1 className="text-xl font-medium mb-2">Create your account</h1>
          <p className="text-sm text-gray-500">
            For pediatric oncology clinical teams.
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full px-5 py-2.5 rounded-lg border border-gray-200 text-sm"
        >
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="name" className="text-sm text-gray-600 block mb-1">
              Full name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Jane Doe"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm text-gray-600 block mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="janedoe@childrenshospital.org"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm text-gray-600 block mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters.</p>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 px-5 py-2.5 rounded-lg bg-teal text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-teal">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
