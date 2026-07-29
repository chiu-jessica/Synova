import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/current-user";
import { getSupabaseServiceClient } from "@/lib/supabase";

const MIN_PASSWORD_LENGTH = 8;

// Email is deliberately not editable: the signed-in session is keyed by email
// address, and for Google accounts it is owned by Google rather than by this
// database — changing it here would strand the account. Change it directly in
// the physicians table if it ever genuinely needs to move.
type Body =
  | { action: "name"; name?: string }
  | { action: "password"; currentPassword?: string; newPassword?: string };

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// Updates the signed-in physician's own row. The row is always resolved from
// the session — never from the request body — so one account can't edit
// another's profile.
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return badRequest("You are not signed in.", 401);
  if (!user.physicianId) {
    return badRequest("No physician record is linked to this account.", 400);
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const supabase = getSupabaseServiceClient();

  if (body.action === "name") {
    const name = body.name?.trim() ?? "";
    if (!name) return badRequest("Name cannot be empty.");
    if (name.length > 120) return badRequest("Name is too long.");

    const { error } = await supabase
      .from("physicians")
      .update({ name })
      .eq("id", user.physicianId);

    if (error) {
      console.error("Failed to update name:", error.message);
      return badRequest("Could not update your name. Please try again.", 500);
    }
    return NextResponse.json({ ok: true, name });
  }

  if (body.action === "password") {
    const newPassword = body.newPassword ?? "";
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return badRequest(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      );
    }

    const { data, error: readError } = await supabase
      .from("physicians")
      .select("password_hash")
      .eq("id", user.physicianId)
      .maybeSingle();

    if (readError || !data) {
      console.error("Failed to read password hash:", readError?.message);
      return badRequest("Could not update your password. Please try again.", 500);
    }

    // Accounts that already have a password must prove they know it. Accounts
    // created through Google have none yet, so they can set a first one.
    if (data.password_hash) {
      const currentPassword = body.currentPassword ?? "";
      if (!currentPassword) {
        return badRequest("Enter your current password.");
      }
      const valid = await bcrypt.compare(currentPassword, data.password_hash);
      if (!valid) return badRequest("Current password is incorrect.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { error } = await supabase
      .from("physicians")
      .update({ password_hash: passwordHash })
      .eq("id", user.physicianId);

    if (error) {
      console.error("Failed to update password:", error.message);
      return badRequest("Could not update your password. Please try again.", 500);
    }
    return NextResponse.json({ ok: true });
  }

  return badRequest("Unknown action.");
}
