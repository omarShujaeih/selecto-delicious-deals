alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists area text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_username_lower_unique
on public.profiles (lower(username))
where username is not null;

create or replace function public.complete_customer_profile(
  _username text,
  _full_name text,
  _city text,
  _area text default null,
  _phone_number text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_username text := lower(trim(_username));
  saved_profile public.profiles;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if normalized_username !~ '^[a-z0-9_]{3,32}$' then
    raise exception 'Invalid username';
  end if;

  if nullif(trim(_full_name), '') is null then
    raise exception 'Full name is required';
  end if;

  if nullif(trim(_city), '') is null then
    raise exception 'City is required';
  end if;

  insert into public.profiles (
    id,
    username,
    full_name,
    display_name,
    city,
    area,
    phone_number,
    updated_at
  )
  values (
    current_user_id,
    normalized_username,
    trim(_full_name),
    trim(_full_name),
    trim(_city),
    nullif(trim(coalesce(_area, '')), ''),
    nullif(trim(coalesce(_phone_number, '')), ''),
    now()
  )
  on conflict (id) do update set
    username = excluded.username,
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    city = excluded.city,
    area = excluded.area,
    phone_number = coalesce(excluded.phone_number, public.profiles.phone_number),
    updated_at = now()
  returning * into saved_profile;

  insert into public.user_roles (user_id, role)
  values (current_user_id, 'customer')
  on conflict (user_id, role) do nothing;

  return saved_profile;
exception
  when unique_violation then
    raise exception 'Username is already taken';
end;
$$;

revoke all on function public.complete_customer_profile(text, text, text, text, text) from public;
grant execute on function public.complete_customer_profile(text, text, text, text, text) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role := 'customer';
begin
  insert into public.profiles (id, display_name, full_name, phone_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.phone
  )
  on conflict (id) do nothing;

  if new.email = 'omar@example.com' then
    v_role := 'admin';
  end if;

  insert into public.user_roles (user_id, role)
  values (new.id, v_role)
  on conflict do nothing;

  return new;
end;
$$;
