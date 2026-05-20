-- Checkout writes must go through the trusted server function.
-- Customers can still read their own transactions through the existing select policy.
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
  quantity int;
  new_transaction_id uuid;
  buyer_id uuid := auth.uid();
begin
  if buyer_id is null then
    raise exception 'Unauthorized';
  end if;

  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then
    raise exception 'Order must include at least one item';
  end if;

  if jsonb_array_length(_items) > 20 then
    raise exception 'Order has too many items';
  end if;

  for item in select * from jsonb_array_elements(_items)
  loop
    quantity := coalesce((item->>'quantity')::int, 0);
    if quantity < 1 or quantity > 10 then
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

    for _counter in 1..quantity
    loop
      insert into public.transactions (offer_id, restaurant_id, customer_id, sale_amount)
      values (offer_row.id, offer_row.restaurant_id, buyer_id, offer_row.discounted_price)
      returning id into new_transaction_id;

      transaction_id := new_transaction_id;
      return next;
    end loop;

    update public.offers
    set active = false
    where id = offer_row.id;
  end loop;
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to authenticated;
