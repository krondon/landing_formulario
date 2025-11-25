-- Clean Supabase setup script (2025-11-21T21:45:22.455Z)
-- Run in SQL editor. Adjust before production.

-- Main table
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
create unique index if not exists leads_chacao_email_uq on public.leads_chacao (lower(email));
create index if not exists leads_chacao_cedula_idx on public.leads_chacao (cedula);
create index if not exists leads_chacao_created_idx on public.leads_chacao (created_at);

-- Enable RLS
alter table public.leads_chacao enable row level security;

-- Insert policy (remove drop if first run)
drop policy if exists leads_chacao_insert on public.leads_chacao;
create policy leads_chacao_insert on public.leads_chacao for insert to anon with check (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and
  length(nombre_apellido) >= 3 and
  length(cedula) between 5 and 15 and
  length(telefono) between 8 and 20 and
  zona is not null
);

-- Select policy (TEMP: anon read for export modal; tighten for production)
drop policy if exists leads_chacao_select on public.leads_chacao;
create policy leads_chacao_select on public.leads_chacao for select to anon using ( true );

-- Export view
create or replace view public.leads_chacao_export as
select email, nombre_apellido, cedula, telefono, zona, created_at
from public.leads_chacao
order by created_at desc;

-- Grants (uncomment / adjust as needed)
-- revoke all on public.leads_chacao from public;
-- grant insert on public.leads_chacao to anon;
-- grant select on public.leads_chacao_export to authenticated;

-- End
