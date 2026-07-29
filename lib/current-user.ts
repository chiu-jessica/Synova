import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServiceClient } from "@/lib/supabase";

export interface CurrentUser {
  // null when signed in via Google without a matching `physicians` row yet —
  // the account can be displayed, but owns no patients.
  physicianId: string | null;
  name: string;
  email: string;
  // Whether a password has been set. Only the boolean crosses to the client;
  // the hash itself never leaves the server.
  hasPassword: boolean;
}

// Resolves the signed-in user from their NextAuth session email, preferring
// the `physicians` row so profile edits made in the database show up.
// Cached so the layout, sidebar, and page bodies share one lookup per request.
export const getCurrentUser = cache(async function getCurrentUser(): Promise<
  CurrentUser | null
> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  const { data, error } = await getSupabaseServiceClient()
    .from("physicians")
    .select("id, name, email, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Failed to look up physician:", error.message);
  }

  return {
    physicianId: data?.id ?? null,
    name: data?.name ?? session.user?.name ?? email,
    email: data?.email ?? email,
    hasPassword: Boolean(data?.password_hash),
  };
});

export async function getCurrentPhysicianId(): Promise<string | null> {
  return (await getCurrentUser())?.physicianId ?? null;
}
