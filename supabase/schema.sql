-- Rode no SQL Editor do Supabase (Database → SQL Editor).
-- Conteúdo público do site: leitura para todos; escrita só para usuário autenticado.

create table if not exists public.site_content (
  id text primary key default 'main',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "site_content_select_public" on public.site_content;
create policy "site_content_select_public"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "site_content_insert_auth" on public.site_content;
create policy "site_content_insert_auth"
  on public.site_content for insert
  to authenticated
  with check (true);

drop policy if exists "site_content_update_auth" on public.site_content;
create policy "site_content_update_auth"
  on public.site_content for update
  to authenticated
  using (true)
  with check (true);

-- Opcional: primeira linha vazia (o site também cria no primeiro salvamento autenticado)
insert into public.site_content (id, payload)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
