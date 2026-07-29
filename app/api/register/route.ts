import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServiceClient } from "@/lib/supabase";

const MIN_PASSWORD_LENGTH = 8;

// Creates a `physicians` row with a bcrypt-hashed password. Runs on the
// server with the service client so the hash is never computed or handled
// in the browser.
export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are all required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();

  const { data: existing } = await supabase
    .from("physicians")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from("physicians")
    .insert({ name, email, password_hash: passwordHash })
    .select("id")
    .single();

  if (error) {
    // 23505 = unique_violation, i.e. the email was taken between the check
    // above and this insert.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }
    console.error("Failed to create physician:", error.message);
    return NextResponse.json(
      { error: "Could not create the account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
