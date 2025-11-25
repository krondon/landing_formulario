# Landing formulario (Supabase)

Formulario sencillo que inserta leads en una tabla `leads_chacao` de Supabase usando `@supabase/supabase-js` via CDN.

## Pasos
1. Crear proyecto en Supabase y copiar `Project URL` y `anon public key`.
2. Editar `script.js` reemplazando SUPABASE_URL y SUPABASE_ANON_KEY.
3. Crear tabla (puedes usar el SQL):
```sql
create table public.leads_chacao (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nombre_apellido text not null,
  cedula text not null,
  telefono text not null,
  zona text not null,
  created_at timestamptz default now()
);
create index on public.leads (email);
```
4. Activar RLS (opcional). Si activas RLS añade una policy de inserción para anon:
```sql
alter table public.leads_chacao enable row level security;
create policy "allow insert leads" on public.leads for insert with check (true);
```
5. Abrir `index.html` en el navegador y probar.

## Notas seguridad
- No publiques claves si el repositorio es público sin revisar las policies.
- Para producción considera verificación de email + rate limiting (Cloudflare, etc).

## Despliegue rápido
Puedes subir estos archivos a Netlify, Vercel (static), Github Pages, etc.
