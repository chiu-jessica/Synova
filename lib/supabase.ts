import { createClient } from "@supabase/supabase-js";

// Client for use in the browser / client components (respects Row Level Security)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-only client with elevated privileges — NEVER import this in a
// client component. Use only inside API routes / server actions.
export function getSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
