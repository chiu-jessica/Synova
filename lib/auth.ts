import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { ensurePhysician } from "@/lib/physicians";

// Central auth config. Swapping to a hospital SSO provider later means
// changing this file only — no page-level code should import a provider
// directly.
export const authOptions: NextAuthOptions = {
  // Required for the credentials provider: it has no database adapter to
  // persist sessions against, so sessions are carried in a JWT.
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const { data, error } = await getSupabaseServiceClient()
          .from("physicians")
          .select("id, name, email, password_hash")
          .eq("email", credentials.email.trim().toLowerCase())
          .maybeSingle();

        if (error) {
          console.error("Credentials lookup failed:", error.message);
          return null;
        }
        // No hash means a Google-only account — refuse password login rather
        // than letting it be claimed with an arbitrary password.
        if (!data?.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          data.password_hash
        );
        if (!valid) return null;

        return { id: data.id, name: data.name, email: data.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Signing in with Google doubles as signing up: the first time an
    // account appears, its physicians row is created here. Sign-in is
    // refused if that fails, rather than handing back a session with no
    // record behind it — which would look like a working account whose
    // patients silently never save.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;
      return ensurePhysician({ email: user.email, name: user.name });
    },
    async session({ session }) {
      // The physician's internal id is resolved from session.user.email by
      // getCurrentPhysicianId() in lib/patients.ts, which works for both
      // providers — nothing extra needs attaching here.
      return session;
    },
  },
};
