import { getSupabaseServiceClient } from "@/lib/supabase";

// Creates the `physicians` row for an OAuth account the first time it signs
// in, so a Google user ends up with the same backing record as one that
// registered with a password. `password_hash` stays null, which is what
// blocks the account from being claimed via the password form.
//
// Lives outside lib/auth.ts to keep that file free of a circular import with
// lib/current-user.ts.
export async function ensurePhysician(input: {
  email: string;
  name?: string | null;
}): Promise<boolean> {
  const email = input.email.trim().toLowerCase();
  if (!email) return false;

  const supabase = getSupabaseServiceClient();

  const { data: existing, error: lookupError } = await supabase
    .from("physicians")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("Physician lookup failed:", lookupError.message);
    return false;
  }
  if (existing) return true;

  const { error } = await supabase
    .from("physicians")
    .insert({ name: input.name?.trim() || email, email });

  if (error) {
    // 23505 = unique_violation: a concurrent sign-in already created it,
    // which is the outcome we wanted anyway.
    if (error.code === "23505") return true;
    console.error("Failed to create physician:", error.message);
    return false;
  }
  return true;
}
