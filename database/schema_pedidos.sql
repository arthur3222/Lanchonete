-- Tabela lanchonete (se já existir, remova esta criação)
create table if not exists public.lanchonete (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

-- Opcional: enum de status (use constraint se não quiser enum)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'status_pedido') then
    create type status_pedido as enum ('pendente','preparando','pronto','entregue','cancelado');
  end if;
end $$;

-- Tabela pedidos
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  lanchonete_id uuid not null references public.lanchonete(id) on delete cascade,
  origem text, -- ex: 'sesc', 'senac' (redundante, mas útil para filtros rápidos)
  itens jsonb not null, -- array de itens do carrinho
  total numeric(10,2) not null default 0,
  status status_pedido not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garante colunas (se a tabela já existia sem elas)
alter table public.pedidos
  add column if not exists produto_nome text,
  add column if not exists produto_quantidade integer;

-- Atualiza updated_at automaticamente
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists pedidos_touch_updated_at on public.pedidos;
create trigger pedidos_touch_updated_at
before update on public.pedidos
for each row execute procedure public.touch_updated_at();

-- Recria função/trigger de sincronização (caso já tenha sido criada antes)
drop trigger if exists pedidos_sync_produto_campos on public.pedidos;
drop function if exists public.pedidos_sync_produto_campos();

create or replace function public.pedidos_sync_produto_campos()
returns trigger language plpgsql as $$
declare
  item jsonb;
begin
  if new.itens is not null
     and jsonb_typeof(new.itens) = 'array'
     and jsonb_array_length(new.itens) = 1 then
    item := new.itens->0;
    new.produto_nome := coalesce(item->>'nome', new.produto_nome);
    new.produto_quantidade := coalesce((item->>'quantidade')::int, new.produto_quantidade);
  end if;
  return new;
end $$;

create trigger pedidos_sync_produto_campos
before insert or update on public.pedidos
for each row execute procedure public.pedidos_sync_produto_campos();

-- Índices
create index if not exists idx_pedidos_lanchonete_id on public.pedidos(lanchonete_id);
create index if not exists idx_pedidos_status on public.pedidos(status);
create index if not exists idx_pedidos_created_at on public.pedidos(created_at);
create index if not exists idx_pedidos_produto_nome on public.pedidos(produto_nome);

-- Exemplo de inserção de lanchonetes
insert into public.lanchonete (nome) values ('sesc')
on conflict (nome) do nothing;
insert into public.lanchonete (nome) values ('senac')
on conflict (nome) do nothing;

-- Exemplo de pedido (substitua <UUID_SESC>)
-- select id from lanchonete where nome='sesc';
-- insert into public.pedidos (lanchonete_id, origem, itens, total)
-- values (
--   '<UUID_SESC>',
--   'sesc',
--   '[{"nome":"Café","preco":4.50},{"nome":"Pão de queijo","preco":6.00}]'::jsonb,
--   10.50
-- );

-- (Opcional) Policies Supabase (ativa RLS antes)
-- alter table public.pedidos enable row level security;
-- create policy "select own pedidos" on public.pedidos for select using (true);
-- create policy "insert pedidos" on public.pedidos for insert with check (true);
-- Ajuste políticas conforme autenticação/controle desejado.
