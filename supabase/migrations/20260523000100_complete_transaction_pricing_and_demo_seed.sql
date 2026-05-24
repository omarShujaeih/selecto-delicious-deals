-- Keep transaction pricing columns available on fresh databases.
alter table public.transactions add column if not exists restaurant_price numeric(10,2);
alter table public.transactions add column if not exists commission_rate numeric(4,2);
alter table public.transactions add column if not exists customer_total_price numeric(10,2);
alter table public.transactions add column if not exists restaurant_payout numeric(10,2);
alter table public.transactions add column if not exists status text;

create or replace function public.set_commission()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.restaurant_price := coalesce(new.restaurant_price, new.sale_amount);
  new.commission_rate := coalesce(new.commission_rate, 0.20);
  new.commission_amount := round(new.restaurant_price * new.commission_rate, 2);
  new.customer_total_price := new.restaurant_price + new.commission_amount;
  new.restaurant_payout := new.restaurant_price;
  new.status := coalesce(new.status, 'Pending');
  return new;
end;
$$;

-- Demo transactions are only inserted when the demo customer exists and there
-- are no transactions yet. This makes dashboards useful without duplicating rows.
insert into public.transactions (offer_id, restaurant_id, customer_id, sale_amount)
select o.id, o.restaurant_id, u.id, o.discounted_price
from auth.users u
join public.offers o on o.id in (
  '10000000-0001-4000-8000-000000000001'::uuid,
  '10000000-0002-4000-8000-000000000001'::uuid,
  '10000000-0004-4000-8000-000000000001'::uuid
)
where u.email = 'customer@example.com'
  and not exists (select 1 from public.transactions)
limit 3;
