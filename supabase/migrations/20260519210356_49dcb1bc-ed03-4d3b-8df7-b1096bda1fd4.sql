
-- 1. Update handle_new_user: auto-grant admin for omar@example.com
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role := 'customer';
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;

  if new.email = 'omar@example.com' then
    v_role := 'admin';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, v_role)
  on conflict do nothing;
  return new;
end;
$$;

-- Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Fix user_roles INSERT: allow user to self-add 'restaurant' role only
drop policy if exists "user_roles self insert restaurant" on public.user_roles;
create policy "user_roles self insert restaurant"
on public.user_roles for insert to authenticated
with check (auth.uid() = user_id and role = 'restaurant');

-- 3. Clear old seed restaurants/offers (no owners, no transactions reference them)
delete from public.offers where restaurant_id in (select id from public.restaurants where owner_id is null);
delete from public.restaurants where owner_id is null;

-- 4. Seed 8 Ramallah restaurants + offers
with r as (
  insert into public.restaurants (name, cuisine, city, rating, active) values
    ('Zaman Restaurant', 'Levantine', 'Ramallah', 4.7, true),
    ('Pronto Resto-Café', 'Italian', 'Ramallah', 4.5, true),
    ('Darna Restaurant', 'Palestinian', 'Ramallah', 4.6, true),
    ('Azure Restaurant', 'Mediterranean', 'Ramallah', 4.4, true),
    ('La Vie Café', 'Cafe', 'Ramallah', 4.3, true),
    ('Sangria''s', 'International', 'Ramallah', 4.5, true),
    ('Beit Aneeseh', 'Levantine', 'Ramallah', 4.6, true),
    ('Rukab''s Ice Cream', 'Desserts', 'Ramallah', 4.8, true)
  returning id, name
)
insert into public.offers (restaurant_id, name, description, image, category, cuisine, original_price, discounted_price, valid_until, prep_minutes, distance_km, rating, active)
select r.id, o.name, o.description, o.image, o.category, o.cuisine, o.original_price, o.discounted_price, 'Today, 10:00 PM', o.prep, o.dist, 4.5, true
from r
join lateral (values
  (case r.name
    when 'Zaman Restaurant' then 'Mixed Grill Platter' when 'Pronto Resto-Café' then 'Margherita Pizza'
    when 'Darna Restaurant' then 'Musakhan Roll' when 'Azure Restaurant' then 'Seafood Pasta'
    when 'La Vie Café' then 'Avocado Toast' when 'Sangria''s' then 'Cheesy Burger'
    when 'Beit Aneeseh' then 'Mansaf Plate' when 'Rukab''s Ice Cream' then 'Pistachio Sundae'
  end,
  'A Ramallah favorite at a special price tonight.',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  case r.name when 'Pronto Resto-Café' then 'Pizzas' when 'Sangria''s' then 'Burgers' when 'Azure Restaurant' then 'Asian' else 'Bowls' end,
  r.name, 18.00, 12.00, '25-30 min', 1.4
),
(
  case r.name
    when 'Zaman Restaurant' then 'Shish Tawook' when 'Pronto Resto-Café' then 'Pasta Carbonara'
    when 'Darna Restaurant' then 'Maqluba Lunch' when 'Azure Restaurant' then 'Grilled Salmon'
    when 'La Vie Café' then 'Cappuccino + Cake' when 'Sangria''s' then 'Chicken Wings'
    when 'Beit Aneeseh' then 'Mixed Mezza' when 'Rukab''s Ice Cream' then 'Arabic Ice Cream Tub'
  end,
  'Limited tonight — fresh and discounted.',
  'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
  'Bowls', r.name, 22.00, 14.50, '20-25 min', 2.0
),
(
  case r.name
    when 'Zaman Restaurant' then 'Hummus & Falafel Combo' when 'Pronto Resto-Café' then 'Lasagna Bolognese'
    when 'Darna Restaurant' then 'Lamb Kebab Skewer' when 'Azure Restaurant' then 'Veggie Bowl'
    when 'La Vie Café' then 'Breakfast Plate' when 'Sangria''s' then 'Chef Salad'
    when 'Beit Aneeseh' then 'Sayadiyeh' when 'Rukab''s Ice Cream' then 'Mango Sorbet'
  end,
  'Fresh today only.',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'Bowls', r.name, 14.00, 9.00, '15-20 min', 1.1
)
) as o(name, description, image, category, cuisine, original_price, discounted_price, prep, dist) on true;

-- 5. Promote existing omar@example.com if already signed up
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'omar@example.com'
on conflict do nothing;
