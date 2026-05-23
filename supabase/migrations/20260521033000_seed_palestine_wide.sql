-- Ensure required columns exist on public.restaurants
alter table public.restaurants add column if not exists contact_email text;
alter table public.restaurants add column if not exists address text;
alter table public.restaurants add column if not exists map_url text;

-- Update set_commission to calculate and populate all pricing columns
create or replace function public.set_commission()
returns trigger
language plpgsql
as $$
begin
  new.restaurant_price := new.sale_amount;
  new.commission_rate := 0.20;
  new.commission_amount := round(new.sale_amount * 0.20, 2);
  new.customer_total_price := new.sale_amount + round(new.sale_amount * 0.20, 2);
  new.restaurant_payout := new.sale_amount;
  if new.status is null then
    new.status := 'Pending';
  end if;
  return new;
end;
$$;

-- Seed additional Palestinian restaurants in other cities
with partner_restaurants (id, name, cuisine, city, rating, contact_email, address, map_url) as (
  values
    ('00000000-0002-4111-8111-111111111111'::uuid, 'Nablus Kunafa House', 'Desserts / Sweets', 'Nablus', 4.9, 'kunafa.nablus@selecto.ps', 'Old City Main Entrance, Nablus', 'https://maps.google.com/?q=Nablus+Kunafa+House'),
    ('00000000-0002-4222-8222-222222222222'::uuid, 'Rafidia Grill', 'Arabic / Grills', 'Nablus', 4.7, 'rafidia.grill@selecto.ps', 'Rafidia Main Street, Nablus', 'https://maps.google.com/?q=Rafidia+Grill+Nablus'),
    ('00000000-0003-4111-8111-111111111111'::uuid, 'Khalil Grill', 'Middle Eastern / Grill', 'Hebron', 4.8, 'khalil.grill@selecto.ps', 'Ein Sarah Street, Hebron', 'https://maps.google.com/?q=Khalil+Grill+Hebron'),
    ('00000000-0003-4222-8222-222222222222'::uuid, 'Al-Haram Bakery', 'Manaqeesh / Bakery', 'Hebron', 4.6, 'haram.bakery@selecto.ps', 'Near Al-Haram Al-Ibrahimi, Hebron', 'https://maps.google.com/?q=Al-Haram+Bakery+Hebron'),
    ('00000000-0004-4111-8111-111111111111'::uuid, 'Bethlehem Bites', 'Palestinian / International', 'Bethlehem', 4.6, 'bethlehem.bites@selecto.ps', 'Manger Street, Bethlehem', 'https://maps.google.com/?q=Bethlehem+Bites'),
    ('00000000-0005-4111-8111-111111111111'::uuid, 'Old City Delights', 'Traditional Arabic', 'Jerusalem', 4.9, 'jerusalem.delights@selecto.ps', 'Al-Wad Street, Old City, Jerusalem', 'https://maps.google.com/?q=Old+City+Delights+Jerusalem'),
    ('00000000-0006-4111-8111-111111111111'::uuid, 'Jenin Greens', 'Healthy Bowls / Cafe', 'Jenin', 4.5, 'jenin.greens@selecto.ps', 'Abu Bakr Street, Jenin', 'https://maps.google.com/?q=Jenin+Greens'),
    ('00000000-0007-4111-8111-111111111111'::uuid, 'Karam Shawarma', 'Shawarma / Fast Food', 'Tulkarm', 4.7, 'karam.shawarma@selecto.ps', 'Al-Sikka Street, Tulkarm', 'https://maps.google.com/?q=Karam+Shawarma+Tulkarm'),
    ('00000000-0008-4111-8111-111111111111'::uuid, 'Qalqilya Burger', 'Burgers / Fries', 'Qalqilya', 4.4, 'qalqilya.burger@selecto.ps', 'Downtown, Qalqilya', 'https://maps.google.com/?q=Qalqilya+Burger'),
    ('00000000-0009-4111-8111-111111111111'::uuid, 'Jericho Palms Cafe', 'Cafe / Juice Bar', 'Jericho', 4.5, 'jericho.palms@selecto.ps', 'Qasr Hisham Road, Jericho', 'https://maps.google.com/?q=Jericho+Palms+Cafe')
)
insert into public.restaurants (id, name, cuisine, city, rating, active, contact_email, address, map_url)
select id, name, cuisine, city, rating, true, contact_email, address, map_url
from partner_restaurants
on conflict (id) do update set
  name = excluded.name,
  cuisine = excluded.cuisine,
  city = excluded.city,
  rating = excluded.rating,
  active = true,
  contact_email = excluded.contact_email,
  address = excluded.address,
  map_url = excluded.map_url;

-- Seed corresponding Palestine-wide offers
with partner_offers (
  id, restaurant_id, name, description, image, category, cuisine,
  original_price, discounted_price, valid_until, prep_minutes, pickup_time,
  distance_km, rating
) as (
  values
    ('10000000-0002-0000-8000-000000000001'::uuid, '00000000-0002-4111-8111-111111111111'::uuid, 'Arabic Kunafa Box', 'Freshly baked authentic Nabulsi Kunafa, rich in cheese and sweet syrup.', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Arabic Sweets', 25.00, 18.00, 'Today, 9:00 PM', '15-20 min', '4:00 PM - 8:00 PM', 0.5, 4.9),
    ('10000000-0002-0000-8000-000000000002'::uuid, '00000000-0002-4222-8222-222222222222'::uuid, 'Shish Tawook Plate', 'Grilled marinated chicken skewers with garlic toum, salad, and pita bread.', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80', 'Burgers', 'Arabic', 45.00, 32.00, 'Today, 10:00 PM', '25-30 min', '6:00 PM - 9:00 PM', 1.2, 4.7),
    ('10000000-0003-0000-8000-000000000001'::uuid, '00000000-0003-4111-8111-111111111111'::uuid, 'Kebab Plate Deal', 'Juicy grilled lamb kebab skewers served with grilled vegetables and rice.', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Arabic', 55.00, 39.00, 'Today, 10:30 PM', '30 min', '5:00 PM - 8:30 PM', 0.9, 4.8),
    ('10000000-0003-0000-8000-000000000002'::uuid, '00000000-0003-4222-8222-222222222222'::uuid, 'Zaatar & Cheese Manakeesh', 'Oven-baked manaqeesh using premium local olive oil, wild zaatar, and white cheese.', 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=1200&q=80', 'Pizzas', 'Bakery', 20.00, 14.00, 'Today, 1:00 PM', '10-15 min', '8:00 AM - 11:30 AM', 1.4, 4.6),
    ('10000000-0004-0000-8000-000000000001'::uuid, '00000000-0004-4111-8111-111111111111'::uuid, 'Musakhan Roll Basket', 'Caramelized onion and sumac chicken rolls, wrapped in thin taboon bread.', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Palestinian', 35.00, 24.00, 'Today, 8:00 PM', '20 min', '12:00 PM - 3:00 PM', 1.0, 4.6),
    ('10000000-0005-0000-8000-000000000001'::uuid, '00000000-0005-4111-8111-111111111111'::uuid, 'Falafel & Hummus Feast', 'Crispy sesame falafel balls, smooth hummus, pickles, and hot pita bread.', 'https://images.unsplash.com/photo-1547058886-af77d0cf0c0d?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Arabic', 25.00, 16.00, 'Today, 6:00 PM', '15 min', '9:00 AM - 1:00 PM', 0.4, 4.9),
    ('10000000-0006-0000-8000-000000000001'::uuid, '00000000-0006-4111-8111-111111111111'::uuid, 'Grilled Chicken Bowl', 'Healthy grilled chicken breast with vegetables and rice bowl.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Healthy', 40.00, 28.00, 'Today, 9:00 PM', '20-25 min', '1:00 PM - 4:00 PM', 1.1, 4.5),
    ('10000000-0007-0000-8000-000000000001'::uuid, '00000000-0007-4111-8111-111111111111'::uuid, 'Karam Shawarma Combo', 'Toasted chicken shawarma wraps with garlic sauce, fries, and pickles.', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80', 'Burgers', 'Arabic', 30.00, 21.00, 'Today, 10:00 PM', '15 min', '4:00 PM - 8:00 PM', 0.8, 4.7),
    ('10000000-0008-0000-8000-000000000001'::uuid, '00000000-0008-4111-8111-111111111111'::uuid, 'Classic Beef Burger Combo', 'Grilled beef patty, melted cheese, fries, and drink.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 'Burgers', 'International', 35.00, 25.00, 'Today, 9:00 PM', '20 min', '5:00 PM - 8:00 PM', 0.7, 4.4),
    ('10000000-0009-0000-8000-000000000001'::uuid, '00000000-0009-4111-8111-111111111111'::uuid, 'Fresh Avocado Juice Jar', 'Rich creamy fresh avocado juice blended with local dates and nuts.', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Cafe', 18.00, 12.00, 'Today, 8:00 PM', '10 min', '10:00 AM - 6:00 PM', 1.3, 4.5)
)
insert into public.offers (
  id, restaurant_id, name, description, image, category, cuisine,
  original_price, discounted_price, valid_until, prep_minutes, pickup_time,
  distance_km, rating, active
)
select
  id, restaurant_id, name, description, image, category, cuisine,
  original_price, discounted_price, valid_until, prep_minutes, pickup_time,
  distance_km, rating, true
from partner_offers
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
  active = true;
