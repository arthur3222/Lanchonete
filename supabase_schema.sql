-- Schema mínimo para tabela profiles
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  nome text,
  senha text,
  image_url text,
  created_at timestamptz default now()
);

-- Index por email
create unique index if not exists idx_profiles_email on public.profiles(email);
