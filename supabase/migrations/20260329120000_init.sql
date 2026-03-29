-- EYE10 — Supabase schema (replaces Firestore)
-- Run in Supabase SQL Editor or via CLI: supabase db push

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.site_content (
  id text primary key default 'main',
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

alter table public.admins enable row level security;
alter table public.site_content enable row level security;
alter table public.products enable row level security;
alter table public.enquiries enable row level security;
alter table public.orders enable row level security;

drop policy if exists admins_select_own on public.admins;
create policy admins_select_own on public.admins
  for select using (auth.uid() = user_id);

drop policy if exists site_content_read on public.site_content;
create policy site_content_read on public.site_content
  for select using (true);

drop policy if exists site_content_write on public.site_content;
create policy site_content_write on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_read on public.products;
create policy products_read on public.products
  for select using (true);

drop policy if exists products_write on public.products;
create policy products_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists enquiries_insert on public.enquiries;
create policy enquiries_insert on public.enquiries
  for insert with check (true);

drop policy if exists enquiries_select on public.enquiries;
create policy enquiries_select on public.enquiries
  for select using (public.is_admin());

drop policy if exists enquiries_update on public.enquiries;
create policy enquiries_update on public.enquiries
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists enquiries_delete on public.enquiries;
create policy enquiries_delete on public.enquiries
  for delete using (public.is_admin());

drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert with check (true);

drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select using (public.is_admin());

drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists orders_delete on public.orders;
create policy orders_delete on public.orders
  for delete using (public.is_admin());

-- Realtime for live site content in admin/storefront
alter publication supabase_realtime add table public.site_content;

-- Storage (Firebase Storage replacement when not using B2)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());
