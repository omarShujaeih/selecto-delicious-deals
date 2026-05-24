alter table public.offers
  add column if not exists available_quantity integer not null default 10;

update public.offers
set available_quantity = 10
where available_quantity is null or available_quantity < 1;

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

    if not found or coalesce(offer_row.available_quantity, 0) < qty then
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

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to authenticated;
