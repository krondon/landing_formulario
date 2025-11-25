-- Supabase setup script for landing (generated 2025-11-21T21:43:04.329Z)
-- Execute in SQL editor. Adjust policies BEFORE exposing anon key.

-- Ensure pgcrypto for gen_random_uuid (usually enabled by default in Supabase)
-- create extension if not exists pgcrypto;

-- 1. Main table
create table if not exists public.leads_chacao (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nombre_apellido text not null,
  cedula text not null,
  telefono text not null,
  zona text not null,
  created_at timestamptz default now()
);

-- 2. Indexes (unique email optional; remove if duplicates allowed)
create unique index if not exists leads_chacao_email_uq on public.leads_chacao (lower(email));
create index if not exists leads_chacao_cedula_idx on public.leads_chacao (cedula);
create index if not exists leads_chacao_created_idx on public.leads_chacao (created_at);

-- 3. Row Level Security
alter table public.leads_chacao enable row level security;

-- 4. Policies
-- Allow inserts from anon role (form submissions)
drop policy if exists leads_chacao_insert on public.leads_chacao;
create policy leads_chacao_insert on public.leads_chacao for insert
  to anon with check (
    -- Basic sanity checks (tighten as needed)
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and
    length(nombre_apellido) >= 3 and
    length(cedula) between 5 and 15 and
    length(telefono) between 8 and 20 and
    zona is not null
  );

-- DO NOT expose select publicly; keep data private (admin modal currently uses anon which is NOT secure).
-- Recommended: only allow select to service_role or an authenticated role with a custom JWT claim.
-- Example (commented):
-- create policy if not exists leads_chacao_select on public.leads_chacao for select
--   to authenticated using ( true );

-- 5. Optional: rate limiting via Edge Functions (not SQL) or adding a simple insert throttle function.
-- Example skeleton for future (not enforced here):
-- create or replace function public.before_insert_leads_chacao() returns trigger as $$
-- begin
--   -- Add custom logic, e.g., reject if too many from same email in last hour
--   return new;
-- end; $$ language plpgsql security definer;
-- create trigger leads_chacao_rate_limit before insert on public.leads_chacao
--   for each row execute function public.before_insert_leads_chacao();

-- 6. (Optional) audit table
-- create table if not exists public.leads_chacao_audit (
--   id bigint generated always as identity primary key,
--   lead_id uuid,
--   action text,
--   ts timestamptz default now()
-- );
-- create or replace function public.audit_leads_chacao() returns trigger as $$
-- begin
--   insert into public.leads_chacao_audit (lead_id, action) values (new.id, TG_OP);
--   return new;
-- end; $$ language plpgsql;
-- create trigger leads_chacao_audit_trg after insert on public.leads_chacao
--   for each row execute function public.audit_leads_chacao();

-- 7. View for admin export (restrictable)
create or replace view public.leads_chacao_export as
select email, nombre_apellido, cedula, telefono, zona, created_at
from public.leads_chacao
order by created_at desc;

-- Ensure only authorized roles can select from the view (depends on policies above).

-- 8. Grant minimal privileges (optional refinement)
-- revoke all on public.leads_chacao from public;
-- grant insert on public.leads_chacao to anon;
-- grant select on public.leads_chacao_export to authenticated;

-- DONE
