-- Update transactions table for MVP order workflow
alter table public.transactions 
  add column if not exists quantity integer not null default 1,
  add column if not exists customer_note text,
  add column if not exists cancellation_reason text;

-- Update place_order function to insert a single transaction per item with correct quantity
drop function if exists public.place_order(jsonb, text, text);

create or replace function public.place_order(
  _items jsonb,
  _fulfillment_type text default 'pickup',
  _delivery_address text default null,
  _customer_note text default null
)
returns table(transaction_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  offer_row public.offers%rowtype;
  qty int;
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
    qty := coalesce((item->>'quantity')::int, 0);
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

    -- Insert a single transaction with the aggregated price and quantity
    insert into public.transactions (
      offer_id, 
      restaurant_id, 
      customer_id, 
      quantity,
      sale_amount, 
      restaurant_price,
      fulfillment_type, 
      delivery_address,
      customer_note,
      status
    )
    values (
      offer_row.id, 
      offer_row.restaurant_id, 
      buyer_id,
      qty,
      offer_row.discounted_price * qty, -- Total sale amount for this transaction
      offer_row.discounted_price * qty, -- Total restaurant price
      _fulfillment_type,
      _delivery_address,
      _customer_note,
      'confirmed'
    )
    returning id into new_transaction_id;

    transaction_id := new_transaction_id;
    return next;

    -- Update offer inventory
    update public.offers
    set 
      available_quantity = available_quantity - qty,
      active = (available_quantity - qty) > 0
    where id = offer_row.id;
  end loop;
end;
$$;

revoke all on function public.place_order(jsonb, text, text, text) from public;
grant execute on function public.place_order(jsonb, text, text, text) to authenticated;
