import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase URL or publishable key.");
}

async function main() {
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: "customer@example.com",
    password: "OmarSelecto2026",
  });
  if (authError || !auth.user) throw authError ?? new Error("Customer login failed.");

  const { data: offers, error: offerError } = await supabase
    .from("offers")
    .select("id, name, discounted_price, active")
    .eq("active", true)
    .eq("discounted_price", 24)
    .limit(1);
  if (offerError) throw offerError;
  if (!offers?.length) throw new Error("No active offer with restaurant_price = 24 found.");

  const offer = offers[0];
  const { data: txs, error: rpcError } = await supabase.rpc("place_order", {
    _items: [{ offerId: offer.id, quantity: 1 }],
  });
  if (rpcError) throw rpcError;

  const txId = txs?.[0]?.transaction_id;
  if (!txId) throw new Error("Checkout did not return a transaction id.");

  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .select("id, restaurant_price, commission_rate, commission_amount, customer_total_price, restaurant_payout")
    .eq("id", txId)
    .single();
  if (txError) throw txError;

  console.log(JSON.stringify({
    offer: offer.name,
    transaction_id: tx.id,
    restaurant_price: Number(tx.restaurant_price),
    commission_rate: Number(tx.commission_rate),
    commission_amount: Number(tx.commission_amount),
    customer_total_price: Number(tx.customer_total_price),
    restaurant_payout: Number(tx.restaurant_payout),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
