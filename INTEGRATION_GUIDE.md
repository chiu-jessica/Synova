# Synova — integration guide

This covers how to take the scaffolded code and actually run it, then wire
up each real service (auth, database, storage, and eventually the real
model). Follow the sections in order — each one builds on the last.

## 0. What's already built vs. what you need to connect

The codebase includes:
- Full page structure and routing (landing, login, dashboard, patient
  results with 4 sub-views, profile)
- All UI components, styled with the Tropical punch palette
- A mock `/api/analyze-scan` route returning realistic fake results
- A NextAuth config wired for Google OAuth (needs real credentials)
- A Supabase client setup and full schema (needs a real project)

Nothing is connected to real services yet — every "TODO" comment in the
code marks a spot where mock data needs to become a real call.

## 1. Install and run locally

```bash
cd synova
npm install
cp .env.local.example .env.local
npm run dev
```

At this point the app runs with **mock data only** — login won't work yet
(no real Google credentials), and the dashboard/patients pages show the
hardcoded `mockPatients` array from `lib/mock-data.ts`, not a database.
This is intentional as a first checkpoint: confirm the UI renders and
navigates correctly before wiring anything real.

## 2. Set up Google OAuth (for login)

1. Go to the [Google Cloud Console](https://console.cloud.google.com) →
   create a new project (or use an existing one).
2. Go to **APIs & Services → Credentials → Create Credentials → OAuth
   client ID**. Choose "Web application."
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://your-deployed-domain.com/api/auth/callback/google` (production, once deployed)
4. Copy the generated **Client ID** and **Client Secret** into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
5. Generate a random secret for `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`)
   and add it to `.env.local`.
6. Restart `npm run dev`. The "Sign in with Google" button on `/login`
   should now work and redirect to `/dashboard` on success.

**How this connects to the rest of the app**: `lib/auth.ts` is the single
place NextAuth is configured. The `session` callback there is where you'll
later look up (or create) the matching row in the `physicians` Supabase
table, so every page can access `session.user` and a linked physician id.

## 3. Set up Supabase (database + storage)

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor**, paste the contents of
   `supabase/schema.sql`, and run it. This creates all five tables
   (`physicians`, `patients`, `scans`, `scan_results`, `similar_patients`)
   plus basic row-level security.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this one
     server-side only — never expose it to the browser, never prefix it
     with `NEXT_PUBLIC_`)
4. In **Storage**, create a new bucket called `mri-scans` (private, not
   public) for uploaded files.
5. Seed the database with the 8 mock patients so the app has real data to
   demo immediately — either write a small seed script using
   `lib/supabase.ts`'s service client, or insert rows manually via the
   Supabase table editor using the values already in `lib/mock-data.ts`.

**How this connects to the rest of the app**: `lib/supabase.ts` exports two
clients — `supabase` (safe for client components, respects RLS) and
`getSupabaseServiceClient()` (server-only, full access — use this inside
API routes when you need to write data on the physician's behalf, e.g.
after a scan upload).

## 4. Replace mock data with real Supabase queries

Once the database is seeded, swap these specific spots from mock data to
real queries (each is a self-contained change — do them one at a time and
verify the page still works before moving to the next):

- **`app/dashboard/page.tsx`** and **`app/dashboard/patients/page.tsx`**:
  replace `mockPatients` import with a Supabase query, e.g.
  ```ts
  const { data: patients } = await supabase
    .from("patients")
    .select("*, scans(*, scan_results(*))")
    .eq("created_by", physicianId)
    .order("created_at", { ascending: false });
  ```
- **`app/patients/[id]/*/page.tsx`**: replace `getPatient(params.id)` calls
  with a Supabase query filtered by the patient's real id.
- **`lib/mock-data.ts`** can stay in the codebase as seed data / fallback
  for local dev without a configured Supabase project, but production code
  paths should read from Supabase, not this file.

## 5. The real upload flow — done

`UploadDialog.tsx` now stores the file and records real rows. The flow is
three steps:

1. `POST /api/scans/upload-url` returns a short-lived **signed upload URL**.
   The browser uploads the file straight to Supabase Storage with it, so the
   service key stays server-side and multi-megabyte scans never pass through
   an API route body (serverless platforms cap that well below scan sizes —
   this is why the client-side `supabase.storage.upload()` call originally
   sketched here wasn't used: it would have required a public write policy on
   the bucket).
2. The browser uploads to that URL via `uploadToSignedUrl()`.
3. `POST /api/scans` verifies the uploaded object exists, creates the
   `patients` row (`created_by` = the signed-in physician) and `scans` row,
   runs the analysis, and writes `scan_results`.

Objects are stored under `<physician-id>/<uuid>-<filename>`, and
`/api/scans` rejects any path outside the caller's own prefix. Re-using a
patient identifier attaches the new scan to the existing patient rather than
creating a duplicate. If analysis fails, the patient and scan still persist
and the UI shows "Analysis pending".

## 6. Connecting the real ML model (when ready)

This is the most important piece long-term, and it's deliberately isolated
to one file: `lib/analysis.ts`. Both callers — the upload flow in
`/api/scans` and the standalone `/api/analyze-scan` endpoint — go through
`analyzeScan()` there, so swapping the model is a single-file change.

**Recommended architecture**: don't try to run the PyTorch model inside the
Next.js/Vercel environment — Vercel's serverless functions aren't built for
GPU inference or long-running Python processes. Instead:

1. Host the trained model as a **separate small backend service** — a
   FastAPI app wrapping your existing PyTorch inference code (the same
   `build_model` / preprocessing pipeline from your research notebook),
   deployed somewhere with GPU access if needed (e.g. a cloud VM, Modal,
   Replicate, or a simple always-on server if CPU inference is fast enough
   for a single 2D slice).
2. That FastAPI service should expose one endpoint, e.g. `POST /predict`,
   accepting a file (or a signed Supabase Storage URL) and returning JSON:
   ```json
   {
     "predicted_subtype": "high_grade_astrocytoma",
     "confidence": 0.83,
     "heatmap_base64": "...",
     "segmentation_base64": "..."
   }
   ```
3. Replace the body of `analyzeScan()` in `lib/analysis.ts` with a call to
   that FastAPI endpoint instead of returning mock data — this is the only
   file that changes. Store the returned heatmap/segmentation images in
   Supabase Storage and return their paths; `/api/scans` already persists
   whatever it gets into the `scan_results` table.
4. **Do not skip the caveat banners already built into the UI** — they're
   load-bearing for the honest framing of this tool, not decorative, and
   should stay regardless of how good the real model's numbers are.

## 7. Deployment

1. Push the repo to GitHub.
2. Import it into [Vercel](https://vercel.com) — it will auto-detect
   Next.js.
3. Add all `.env.local` variables to Vercel's **Environment Variables**
   settings (Project → Settings → Environment Variables) — these are not
   read from `.env.local` in production, they must be set in Vercel's
   dashboard directly.
4. Update the Google OAuth redirect URI (step 2 above) to include your
   real Vercel domain.
5. Deploy. Confirm login, dashboard, and the upload flow all work against
   the real Supabase project before considering this production-ready.

## 8. What's still explicitly out of scope

Restating from the original prompt, since it matters: this integration
guide gets you to a working, realistically-wired demo app. It does **not**
cover EHR/FHIR integration, HIPAA compliance/BAAs, or clinical validation
of the model — all of which are required before this could touch real
patient data in an actual hospital setting, and none of which are solved by
code alone.
