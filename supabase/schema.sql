-- Synova database schema (Supabase / Postgres)
-- Run this in the Supabase SQL editor for a new project.

-- password_hash is a bcrypt digest, set only for accounts created through
-- the email/password sign-up form. It stays null for physicians who signed
-- in with Google, and those accounts cannot be used for password login.
create table physicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text,
  created_at timestamptz default now()
);

-- Already ran the original schema? Apply just this one column instead:
--   alter table physicians add column password_hash text;

create table patients (
  id uuid primary key default gen_random_uuid(),
  patient_identifier text not null,
  created_by uuid references physicians(id),
  created_at timestamptz default now()
);

create table scans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  file_url text not null,
  sequence_type text default 't1c',
  uploaded_at timestamptz default now()
);

create table scan_results (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) on delete cascade,
  predicted_subtype text not null check (predicted_subtype in ('high_grade_astrocytoma', 'DMG_DIPG')),
  confidence_score numeric not null check (confidence_score >= 0 and confidence_score <= 1),
  heatmap_url text,
  segmentation_url text,
  created_at timestamptz default now()
);

create table similar_patients (
  scan_result_id uuid references scan_results(id) on delete cascade,
  similar_patient_id uuid references patients(id),
  similarity_note text,
  primary key (scan_result_id, similar_patient_id)
);

-- Row Level Security: enable and restrict access to the authenticated
-- physician who created each record. Adjust once auth.uid() <-> physicians
-- linkage is finalized.
alter table patients enable row level security;
alter table scans enable row level security;
alter table scan_results enable row level security;

create policy "Physicians see their own patients"
  on patients for select
  using (created_by = auth.uid());
