
-- ROLES ENUM
create type public.app_role as enum ('customer','restaurant','admin');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- has_role helper (security definer to avoid recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- RESTAURANTS
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  cuisine text not null,
  city text,
  active boolean not null default true,
  rating numeric(2,1) not null default 4.5,
  created_at timestamptz not null default now()
);
alter table public.restaurants enable row level security;

-- OFFERS
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  image text,
  category text,
  cuisine text,
  original_price numeric(10,2) not null,
  discounted_price numeric(10,2) not null,
  valid_until text,
  prep_minutes text,
  distance_km numeric(4,1) default 1.5,
  rating numeric(2,1) default 4.5,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.offers enable row level security;

-- TRANSACTIONS
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  sale_amount numeric(10,2) not null,
  commission_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;

-- Trigger: auto compute 20% commission
create or replace function public.set_commission()
returns trigger
language plpgsql
as $$
begin
  new.commission_amount := round(new.sale_amount * 0.20, 2);
  return new;
end;
$$;
create trigger trg_set_commission
  before insert on public.transactions
  for each row execute function public.set_commission();

-- Trigger: auto-create profile + default customer role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles
create policy "profiles select own or admin" on public.profiles
  for select using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- user_roles
create policy "user_roles select own or admin" on public.user_roles
  for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "user_roles admin manage" on public.user_roles
  for all using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- restaurants: public read; owner manage; admin all
create policy "restaurants public read" on public.restaurants
  for select using (true);
create policy "restaurants owner insert" on public.restaurants
  for insert with check (auth.uid() = owner_id and public.has_role(auth.uid(),'restaurant'));
create policy "restaurants owner update" on public.restaurants
  for update using (auth.uid() = owner_id or public.has_role(auth.uid(),'admin'));
create policy "restaurants admin delete" on public.restaurants
  for delete using (public.has_role(auth.uid(),'admin'));

-- offers: public read (active or owner/admin); restaurant owner manage; admin all
create policy "offers public read active" on public.offers
  for select using (
    active = true
    or exists (select 1 from public.restaurants r where r.id = offers.restaurant_id and r.owner_id = auth.uid())
    or public.has_role(auth.uid(),'admin')
  );
create policy "offers owner insert" on public.offers
  for insert with check (
    public.has_role(auth.uid(),'restaurant')
    and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid())
  );
create policy "offers owner update" on public.offers
  for update using (
    exists (select 1 from public.restaurants r where r.id = offers.restaurant_id and r.owner_id = auth.uid())
    or public.has_role(auth.uid(),'admin')
  );
create policy "offers owner delete" on public.offers
  for delete using (
    exists (select 1 from public.restaurants r where r.id = offers.restaurant_id and r.owner_id = auth.uid())
    or public.has_role(auth.uid(),'admin')
  );

-- transactions: customer sees own; restaurant owner sees own; admin all
create policy "transactions select" on public.transactions
  for select using (
    auth.uid() = customer_id
    or exists (select 1 from public.restaurants r where r.id = transactions.restaurant_id and r.owner_id = auth.uid())
    or public.has_role(auth.uid(),'admin')
  );
create policy "transactions customer insert" on public.transactions
  for insert with check (auth.uid() = customer_id);
