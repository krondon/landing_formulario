-- Schema for leads_chacao table (generated 2025-11-21T21:36:28.367Z)
-- Adjust policies according to your security model.

-- Extensions (gen_random_uuid is provided by pgcrypto in Supabase by default)
-- create extension if not exists pgcrypto;

create table if not exists public.leads_chacao (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nombre_apellido text not null,
  cedula text not null,
  telefono text not null,
  zona text not null,
  created_at timestamptz default now()
);

-- Indexes
create unique index if not exists leads_chacao_email_idx on public.leads_chacao (email);
create index if not exists leads_chacao_cedula_idx on public.leads_chacao (cedula);

-- Enable Row Level Security
alter table public.leads_chacao enable row level security;

-- Policies (minimal). Replace 'true' with tighter conditions if needed.
create policy if not exists "leads_chacao_insert" on public.leads_chacao for insert with check (true);
-- Uncomment if you want public read access (NOT recommended without review):
-- create policy if not exists "leads_chacao_select" on public.leads_chacao for select using ( true );

-- Optional: revoke default public privileges then grant explicit ones
-- revoke all on public.leads_chacao from public;
-- grant insert on public.leads_chacao to anon;  -- Only if anon should insert
-- grant select on public.leads_chacao to authenticated; -- Example

-- Test insert (remove in production):
-- insert into public.leads_chacao (email, nombre_apellido, cedula, telefono, zona) values
-- ('demo@example.com','Demo User','12345678','+58 000 0000000','Altamira');
