-- Canonical Selecto demo reset.
-- Requires the demo auth users to already exist:
-- omar@example.com, zaman@example.com, burgers@example.com, customer@example.com

alter table public.restaurants add column if not exists contact_email text;
alter table public.restaurants add column if not exists address text;
alter table public.restaurants add column if not exists map_url text;
alter table public.offers add column if not exists pickup_time text;
alter table public.offers add column if not exists available_quantity integer not null default 10;
alter table public.transactions add column if not exists restaurant_price numeric(10,2);
alter table public.transactions add column if not exists commission_rate numeric(4,2);
alter table public.transactions add column if not exists customer_total_price numeric(10,2);
alter table public.transactions add column if not exists restaurant_payout numeric(10,2);
alter table public.transactions add column if not exists status text;

create or replace function public.get_my_roles()
returns table(role public.app_role)
language sql
stable
security definer
set search_path = public
as $$
  select ur.role
  from public.user_roles ur
  where ur.user_id = auth.uid()
$$;

create or replace function public.set_commission()
returns trigger
language plpgsql
as $$
begin
  new.restaurant_price := coalesce(new.restaurant_price, new.sale_amount);
  new.commission_rate := 0.20;
  new.commission_amount := round(new.restaurant_price * 0.20, 2);
  new.customer_total_price := new.restaurant_price + round(new.restaurant_price * 0.20, 2);
  new.restaurant_payout := new.restaurant_price;
  if new.status is null then
    new.status := 'Pending';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_commission on public.transactions;
create trigger trg_set_commission
  before insert on public.transactions
  for each row execute function public.set_commission();

drop policy if exists "transactions customer insert" on public.transactions;

create or replace function public.place_order(_items jsonb)
returns table(transaction_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  offer_row public.offers%rowtype;
  qty integer;
  inserted_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  if jsonb_array_length(_items) > 20 then
    raise exception 'Order has too many items';
  end if;

  for item in select * from jsonb_array_elements(_items)
  loop
    qty := coalesce((item->>'quantity')::integer, 1);
    if qty < 1 or qty > 10 then
      raise exception 'Invalid item quantity';
    end if;

    select *
    into offer_row
    from public.offers
    where id = (item->>'offerId')::uuid
      and active = true
    for update;

    if not found then
      raise exception 'One or more offers are no longer available';
    end if;

    if coalesce(offer_row.available_quantity, 0) < qty then
      raise exception 'One or more offers are no longer available';
    end if;

    for i in 1..qty loop
      insert into public.transactions (
        offer_id,
        restaurant_id,
        customer_id,
        sale_amount,
        restaurant_price
      )
      values (
        offer_row.id,
        offer_row.restaurant_id,
        auth.uid(),
        offer_row.discounted_price,
        offer_row.discounted_price
      )
      returning id into inserted_id;

      transaction_id := inserted_id;
      return next;
    end loop;

    update public.offers
    set
      available_quantity = available_quantity - qty,
      active = (available_quantity - qty) > 0
    where id = offer_row.id;
  end loop;
end;
$$;

revoke all on function public.get_my_roles() from public;
grant execute on function public.get_my_roles() to authenticated;
revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to authenticated;

do $$
declare
  admin_id uuid;
  zaman_id uuid;
  burgers_id uuid;
  customer_id uuid;
begin
  select id into admin_id from auth.users where email = 'omar@example.com';
  select id into zaman_id from auth.users where email = 'zaman@example.com';
  select id into burgers_id from auth.users where email = 'burgers@example.com';
  select id into customer_id from auth.users where email = 'customer@example.com';

  if admin_id is null or zaman_id is null or burgers_id is null or customer_id is null then
    raise exception 'Missing one or more demo auth users';
  end if;

  delete from public.transactions
  where restaurant_id in (
    '00000000-1000-4000-8000-000000000001'::uuid,
    '00000000-1000-4000-8000-000000000002'::uuid
  );
  delete from public.offers
  where restaurant_id in (
    '00000000-1000-4000-8000-000000000001'::uuid,
    '00000000-1000-4000-8000-000000000002'::uuid
  );
  delete from public.restaurants
  where id in (
    '00000000-1000-4000-8000-000000000001'::uuid,
    '00000000-1000-4000-8000-000000000002'::uuid
  );

  delete from public.user_roles where user_id in (admin_id, zaman_id, burgers_id, customer_id);
  insert into public.user_roles (user_id, role)
  values
    (admin_id, 'admin'),
    (zaman_id, 'restaurant'),
    (burgers_id, 'restaurant'),
    (customer_id, 'customer')
  on conflict (user_id, role) do nothing;

  insert into public.restaurants (id, owner_id, name, cuisine, city, active, rating, contact_email, address, map_url)
  values
    ('00000000-1000-4000-8000-000000000001'::uuid, zaman_id, 'Zamn Cafe', 'Cafe / Palestinian', 'Ramallah', true, 4.8, 'zaman@example.com', 'Al-Masyoun, Ramallah', 'https://maps.google.com/?q=Zamn+Cafe+Ramallah'),
    ('00000000-1000-4000-8000-000000000002'::uuid, burgers_id, 'Rukab Street Burgers', 'Burgers', 'Ramallah', true, 4.7, 'burgers@example.com', 'Rukab Street, Ramallah', 'https://maps.google.com/?q=Rukab+Street+Burgers')
  on conflict (id) do update set
    owner_id = excluded.owner_id,
    name = excluded.name,
    cuisine = excluded.cuisine,
    city = excluded.city,
    active = true,
    rating = excluded.rating,
    contact_email = excluded.contact_email,
    address = excluded.address,
    map_url = excluded.map_url;

  insert into public.offers (
    id, restaurant_id, name, description, image, category, cuisine,
    original_price, discounted_price, valid_until, prep_minutes, pickup_time,
    distance_km, rating, active, available_quantity
  )
  values
    ('10000000-1000-4000-8000-000000000001'::uuid, '00000000-1000-4000-8000-000000000001'::uuid, 'Arabic Mansaf Cup', 'Warm mansaf rice cup with jameed sauce.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Arabic', 32, 24, 'Today, 9:00 PM', '20 min', '5:00 PM - 8:00 PM', 1.2, 4.8, true, 10),
    ('10000000-1000-4000-8000-000000000002'::uuid, '00000000-1000-4000-8000-000000000001'::uuid, 'Falafel Hummus Box', 'Falafel, hummus, pickles, and pita.', 'https://images.unsplash.com/photo-1547058886-af77d0cf0c0d?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Palestinian', 24, 16, 'Today, 6:00 PM', '15 min', '5:00 PM - 8:00 PM', 0.8, 4.9, true, 10),
    ('10000000-1000-4000-8000-000000000003'::uuid, '00000000-1000-4000-8000-000000000002'::uuid, 'Classic Beef Burger', 'Beef burger with fries.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 'Burgers', 'International', 38, 25, 'Today, 10:00 PM', '20 min', '5:00 PM - 8:00 PM', 1.1, 4.7, true, 10),
    ('10000000-1000-4000-8000-000000000004'::uuid, '00000000-1000-4000-8000-000000000002'::uuid, 'Chicken Burger Combo', 'Crispy chicken burger with fries.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 'Burgers', 'International', 36, 22, 'Today, 10:00 PM', '20 min', '5:00 PM - 8:00 PM', 1.1, 4.6, true, 10)
  on conflict (id) do update set
    restaurant_id = excluded.restaurant_id,
    name = excluded.name,
    description = excluded.description,
    image = excluded.image,
    category = excluded.category,
    cuisine = excluded.cuisine,
    original_price = excluded.original_price,
    discounted_price = excluded.discounted_price,
    valid_until = excluded.valid_until,
    prep_minutes = excluded.prep_minutes,
    pickup_time = excluded.pickup_time,
    distance_km = excluded.distance_km,
    rating = excluded.rating,
    active = true,
    available_quantity = excluded.available_quantity;

  insert into public.transactions (customer_id, restaurant_id, offer_id, sale_amount, restaurant_price)
  values
    (customer_id, '00000000-1000-4000-8000-000000000001'::uuid, '10000000-1000-4000-8000-000000000001'::uuid, 24, 24),
    (customer_id, '00000000-1000-4000-8000-000000000002'::uuid, '10000000-1000-4000-8000-000000000003'::uuid, 25, 25);
end $$;
