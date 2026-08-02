"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

// NextAuth redirects here with ?error=… when a provider sign-in fails —
// including when Google sign-in is refused because the physicians row could
// not be created.
const providerErrors: Record<string, string> = {
  AccessDenied: "We could not finish setting up your account. Please try again.",
  OAuthAccountNotLinked: "That email is already registered with a password.",
  Configuration: "Sign-in is misconfigured. Contact your administrator.",
};

// Only this piece reads the URL. useSearchParams() suspends during
// prerender, so it sits alone behind the Suspense boundary — wrapping the
// whole form in one would leave the page blank until JS hydrated.
function ProviderError({ hidden }: { hidden: boolean }) {
  const providerError = useSearchParams().get("error");
  if (!providerError || hidden) return null;

  return (
    <p className="text-xs text-red-600 mb-4 text-center">
      {providerErrors[providerError] ?? "Could not sign you in. Please try again."}
    </p>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // redirect:false so a bad password renders an inline message instead of
    // bouncing to NextAuth's own error page.
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Logo size={56} className="mb-4" />
          <h1 className="text-xl font-medium mb-2">Sign in to SYNOVA</h1>
          <p className="text-sm text-gray-500">
            For pediatric oncology clinical teams.
          </p>
        </div>

        <Suspense>
          <ProviderError hidden={Boolean(error)} />
        </Suspense>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              className="w-full border-2 border-teal-light rounded-pill px-4 py-2 text-sm focus:border-teal focus:outline-none"
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
              autoComplete="current-password"
              className="w-full border-2 border-teal-light rounded-pill px-4 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 px-5 py-2.5 rounded-pill bg-teal-dark text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-teal-deep disabled:opacity-50"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Signing in…" : "Log in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full px-5 py-2.5 rounded-pill border-2 border-teal-light text-sm font-medium hover:bg-teal-light"
        >
          Sign in with Google
        </button>

        <p className="text-xs text-gray-500 text-center mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-teal">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
