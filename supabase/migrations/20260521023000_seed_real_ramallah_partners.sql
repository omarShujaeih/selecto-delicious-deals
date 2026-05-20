-- Seed real-looking Ramallah partner restaurants and menu offers.
-- This migration is idempotent and avoids touching user-owned restaurants.

alter table public.restaurants add column if not exists contact_email text;
alter table public.restaurants add column if not exists address text;
alter table public.restaurants add column if not exists map_url text;

with partner_restaurants (id, name, cuisine, city, rating, contact_email, address, map_url) as (
  values
    ('11111111-1111-4111-8111-111111111111'::uuid, 'Zest Restaurant', 'Mediterranean / Middle Eastern', 'Ramallah', 4.9, 'zest@selecto.ps', 'Al Ma''ahed Street 35, Ramallah', 'https://www.google.com/maps/search/?api=1&query=Zest%20Restaurant%20Ramallah'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'Darna Restaurant', 'Palestinian / Mediterranean', 'Ramallah', 4.5, 'darna@selecto.ps', 'Al Sahel Street, Ramallah', 'https://www.google.com/maps/search/?api=1&query=Darna%20Restaurant%20Ramallah'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'SnowBar Garden', 'International', 'Ramallah', 4.6, 'snowbar@selecto.ps', 'Ein Sama''an near YWCA, Ramallah', 'https://www.google.com/maps/search/?api=1&query=SnowBar%20Garden%20Ramallah'),
    ('44444444-4444-4444-8444-444444444444'::uuid, 'Pronto', 'Italian / Pizza', 'Ramallah', 4.5, 'pronto@selecto.ps', 'Jaffa Street, Ramallah', 'https://www.google.com/maps/search/?api=1&query=Pronto%20Ramallah'),
    ('55555555-5555-4555-8555-555555555555'::uuid, 'Lazaward', 'Arabic / Steakhouse / Cafe', 'Ramallah', 4.8, 'lazaward@selecto.ps', 'Altira Street, George Habash Square, Ramallah', 'https://www.google.com/maps/search/?api=1&query=Lazaward%20Ramallah'),
    ('66666666-6666-4666-8666-666666666666'::uuid, 'Cafe La Vie', 'Cafe / International', 'Ramallah', 4.7, 'cafelavie@selecto.ps', 'Qastal Street, Ramallah', 'https://www.google.com/maps/search/?api=1&query=Cafe%20La%20Vie%20Ramallah'),
    ('77777777-7777-4777-8777-777777777777'::uuid, 'Azure Restaurant', 'International', 'Ramallah', 4.5, 'azure@selecto.ps', 'Ramallah', 'https://www.google.com/maps/search/?api=1&query=Azure%20Restaurant%20Ramallah'),
    ('88888888-8888-4888-8888-888888888888'::uuid, 'Capers', 'Bar / International', 'Ramallah', 4.5, 'capers@selecto.ps', 'Ramallah', 'https://www.google.com/maps/search/?api=1&query=Capers%20Ramallah'),
    ('99999999-9999-4999-8999-999999999999'::uuid, 'Al-Riad', 'Dining Bar / Arabic', 'Ramallah', 4.9, 'alriad@selecto.ps', 'Ramallah', 'https://www.google.com/maps/search/?api=1&query=Al-Riad%20Ramallah'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid, 'Zeit ou Zaater', 'Manaqeesh / Breakfast', 'Ramallah', 4.4, 'zeitouzaater@selecto.ps', 'Ramallah', 'https://www.google.com/maps/search/?api=1&query=Zeit%20ou%20Zaater%20Ramallah'),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid, 'Janan''s Kitchen', 'Palestinian / Bakery', 'Ramallah', 4.6, 'janans@selecto.ps', 'Al-Yarmouk Street, Masyoun, Ramallah', 'https://www.google.com/maps/search/?api=1&query=Janans%20Kitchen%20Ramallah'),
    ('cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid, 'Meat Moot Ramallah', 'Smoked Meat', 'Ramallah', 4.6, 'meatmoot@selecto.ps', 'Ramallah', 'https://www.google.com/maps/search/?api=1&query=Meat%20Moot%20Ramallah')
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

with partner_offers (
  id, restaurant_id, name, description, image, category, cuisine,
  original_price, discounted_price, valid_until, prep_minutes, pickup_time,
  distance_km, rating
) as (
  values
    ('10000000-0001-4000-8000-000000000001'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Freekeh Risotto', 'Creamy freekeh risotto with Mediterranean herbs and seasonal vegetables.', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'Mediterranean', 58.00, 41.00, 'Today, 10:30 PM', '25-30 min', '6:00 PM - 8:00 PM', 1.1, 4.9),
    ('10000000-0001-4000-8000-000000000002'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Nazarene Qalayah', 'Tender beef cooked with garlic, lemon, peppers, and warm Palestinian spices.', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80', 'Mains', 'Middle Eastern', 72.00, 52.00, 'Today, 10:30 PM', '25-35 min', '7:00 PM - 9:00 PM', 1.1, 4.8),
    ('10000000-0002-4000-8000-000000000001'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'Musakhan Rolls', 'Sumac chicken, caramelized onions, taboon bread, and yogurt dip.', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80', 'Palestinian', 'Palestinian', 38.00, 27.00, 'Today, 9:30 PM', '20-25 min', '1:00 PM - 3:00 PM', 1.4, 4.7),
    ('10000000-0002-4000-8000-000000000002'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'Maqluba Lunch Plate', 'Rice, vegetables, chicken, toasted nuts, salad, and yogurt.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80', 'Lunch', 'Palestinian', 45.00, 32.00, 'Today, 5:00 PM', '20-30 min', '12:30 PM - 2:30 PM', 1.4, 4.6),
    ('10000000-0003-4000-8000-000000000001'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 'Black & Blue Burger', 'Beef burger with blue cheese, caramelized onion, lettuce, and fries.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 'Burgers', 'International', 55.00, 39.00, 'Today, 11:00 PM', '20-25 min', '6:00 PM - 8:00 PM', 2.8, 4.7),
    ('10000000-0003-4000-8000-000000000002'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 'Nachos Supreme', 'Crispy nachos with cheese sauce, salsa, jalapeno, sour cream, and guacamole.', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=1200&q=80', 'Snacks', 'Mexican', 42.00, 29.00, 'Today, 11:00 PM', '15-20 min', '7:00 PM - 9:00 PM', 2.8, 4.5),
    ('10000000-0004-4000-8000-000000000001'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'Margherita Pizza', 'Classic tomato, mozzarella, basil, and olive oil pizza.', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80', 'Pizza', 'Italian', 44.00, 31.00, 'Today, 10:00 PM', '20-25 min', '5:00 PM - 7:00 PM', 1.2, 4.6),
    ('10000000-0004-4000-8000-000000000002'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'Penne Arrabbiata', 'Penne pasta in spicy tomato sauce with garlic, basil, and parmesan.', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80', 'Pasta', 'Italian', 48.00, 34.00, 'Today, 10:00 PM', '20-25 min', '1:00 PM - 3:00 PM', 1.2, 4.5),
    ('10000000-0005-4000-8000-000000000001'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 'Mixed Grill Plate', 'Kebab, shish tawook, kofta, grilled vegetables, fries, and garlic sauce.', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80', 'Grill', 'Arabic', 75.00, 55.00, 'Today, 11:00 PM', '25-35 min', '6:30 PM - 8:30 PM', 2.1, 4.8),
    ('10000000-0005-4000-8000-000000000002'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 'Layali Libnan Dessert', 'Creamy semolina dessert topped with pistachio and orange blossom syrup.', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80', 'Desserts', 'Arabic', 28.00, 19.00, 'Today, 10:00 PM', '10-15 min', '4:00 PM - 6:00 PM', 2.1, 4.7),
    ('10000000-0006-4000-8000-000000000001'::uuid, '66666666-6666-4666-8666-666666666666'::uuid, 'Falafel Garden Salad', 'Falafel with fresh greens, tomatoes, tahini, pickles, and herbs.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', 'Salads', 'Cafe', 36.00, 25.00, 'Today, 9:00 PM', '15-20 min', '12:00 PM - 2:00 PM', 1.5, 4.7),
    ('10000000-0006-4000-8000-000000000002'::uuid, '66666666-6666-4666-8666-666666666666'::uuid, 'Cake & Cappuccino', 'House cake slice with a hot cappuccino.', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80', 'Cafe', 'Cafe', 32.00, 22.00, 'Today, 8:00 PM', '10-15 min', '3:00 PM - 5:00 PM', 1.5, 4.6),
    ('10000000-0007-4000-8000-000000000001'::uuid, '77777777-7777-4777-8777-777777777777'::uuid, 'Grilled Chicken Bowl', 'Grilled chicken breast with rice, vegetables, and house sauce.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 'Bowls', 'International', 52.00, 37.00, 'Today, 10:00 PM', '20-25 min', '2:00 PM - 4:00 PM', 1.9, 4.5),
    ('10000000-0007-4000-8000-000000000002'::uuid, '77777777-7777-4777-8777-777777777777'::uuid, 'Steak Sandwich', 'Sliced steak sandwich with mushrooms, onions, cheese, and fries.', 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=1200&q=80', 'Sandwiches', 'International', 58.00, 42.00, 'Today, 10:00 PM', '20-25 min', '6:00 PM - 8:00 PM', 1.9, 4.5),
    ('10000000-0008-4000-8000-000000000001'::uuid, '88888888-8888-4888-8888-888888888888'::uuid, 'Capers Burger', 'Beef burger with cheddar, lettuce, tomato, onion, and crispy fries.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 'Burgers', 'International', 52.00, 36.00, 'Today, 11:00 PM', '20-25 min', '7:00 PM - 9:00 PM', 1.7, 4.5),
    ('10000000-0008-4000-8000-000000000002'::uuid, '88888888-8888-4888-8888-888888888888'::uuid, 'Chicken Wings Basket', 'Crispy wings tossed in barbecue sauce with fries and dip.', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=1200&q=80', 'Snacks', 'International', 46.00, 33.00, 'Today, 11:00 PM', '20-25 min', '8:00 PM - 10:00 PM', 1.7, 4.4),
    ('10000000-0009-4000-8000-000000000001'::uuid, '99999999-9999-4999-8999-999999999999'::uuid, 'Arabic Mezza Tray', 'Hummus, moutabbal, tabbouleh, pickles, olives, and fresh bread.', 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80', 'Mezza', 'Arabic', 48.00, 34.00, 'Today, 10:30 PM', '15-20 min', '5:00 PM - 7:00 PM', 2.0, 4.8),
    ('10000000-0009-4000-8000-000000000002'::uuid, '99999999-9999-4999-8999-999999999999'::uuid, 'Kofta Skewers', 'Grilled kofta skewers with rice, salad, tahini, and grilled tomato.', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1200&q=80', 'Grill', 'Arabic', 58.00, 42.00, 'Today, 10:30 PM', '25-30 min', '6:00 PM - 8:00 PM', 2.0, 4.8),
    ('10000000-0010-4000-8000-000000000001'::uuid, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid, 'Zaatar & Cheese Manaqeesh', 'Two oven-baked manaqeesh with zaatar, cheese, cucumber, and tomato.', 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=1200&q=80', 'Breakfast', 'Manaqeesh', 26.00, 18.00, 'Today, 1:00 PM', '10-15 min', '8:00 AM - 10:00 AM', 0.9, 4.4),
    ('10000000-0010-4000-8000-000000000002'::uuid, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid, 'Labneh Breakfast Wrap', 'Labneh wrap with olive oil, mint, cucumber, tomato, and olives.', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80', 'Breakfast', 'Breakfast', 22.00, 15.00, 'Today, 1:00 PM', '10-15 min', '9:00 AM - 11:00 AM', 0.9, 4.4),
    ('10000000-0011-4000-8000-000000000001'::uuid, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid, 'Chicken Musakhan Meal', 'Chicken musakhan with onions, sumac, taboon bread, and yogurt.', 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?auto=format&fit=crop&w=1200&q=80', 'Palestinian', 'Palestinian', 42.00, 30.00, 'Today, 7:00 PM', '25-30 min', '1:00 PM - 3:00 PM', 2.3, 4.6),
    ('10000000-0011-4000-8000-000000000002'::uuid, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid, 'Mini Pastries Box', 'A mixed box of savory pastries and mini manaqeesh.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', 'Bakery', 'Bakery', 35.00, 24.00, 'Today, 6:00 PM', '15-20 min', '10:00 AM - 12:00 PM', 2.3, 4.6),
    ('10000000-0012-4000-8000-000000000001'::uuid, 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid, 'Smoked Brisket Plate', 'Slow-smoked brisket with pickles, bread, fries, and barbecue sauce.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 'Smoked Meat', 'Smoked Meat', 88.00, 64.00, 'Today, 10:00 PM', '30-40 min', '6:00 PM - 8:00 PM', 2.5, 4.7),
    ('10000000-0012-4000-8000-000000000002'::uuid, 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid, 'Smoked Ribs Box', 'Tender smoked ribs with coleslaw, fries, pickles, and sauce.', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=80', 'Smoked Meat', 'Smoked Meat', 95.00, 69.00, 'Today, 10:00 PM', '30-40 min', '7:00 PM - 9:00 PM', 2.5, 4.7)
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
