import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const customerEmail = process.env.SEED_CUSTOMER_EMAIL || "customer@example.com";
const customerPassword = process.env.SEED_CUSTOMER_PASSWORD || "OmarSelecto2026";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or publishable key.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: customerEmail,
    password: customerPassword,
  });
  if (authError || !authData.user) {
    throw new Error(`Customer sign-in failed: ${authError?.message ?? "missing user"}`);
  }

  const { count: beforeCount, error: countError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true });

  if (countError) throw countError;
  if ((beforeCount ?? 0) > 0) {
    console.log(`Transactions already seeded (${beforeCount}). Nothing to do.`);
    return;
  }

  const { data: offers, error: offersError } = await supabase
    .from("offers")
    .select("id, name, restaurant_id, restaurants!inner(owner_id)")
    .eq("active", true)
    .not("restaurants.owner_id", "is", null)
    .limit(3);

  if (offersError) throw offersError;
  if (!offers?.length) {
    throw new Error("No active owned offers found to seed transactions.");
  }

  const { data: txs, error: rpcError } = await supabase.rpc("place_order", {
    _items: offers.map((offer) => ({ offerId: offer.id, quantity: 1 })),
  });

  if (rpcError?.message.includes("Could not find the function")) {
    const { data: pricedOffers, error: pricedError } = await supabase
      .from("offers")
      .select("id, restaurant_id, discounted_price")
      .in("id", offers.map((offer) => offer.id));

    if (pricedError) throw pricedError;

    const { data: inserted, error: insertError } = await supabase
      .from("transactions")
      .insert(
        (pricedOffers ?? []).map((offer) => ({
          customer_id: authData.user.id,
          offer_id: offer.id,
          restaurant_id: offer.restaurant_id,
          sale_amount: Number(offer.discounted_price),
          restaurant_price: Number(offer.discounted_price),
        })),
      )
      .select("id");

    if (insertError) throw insertError;

    console.log(`Seeded ${inserted?.length ?? 0} demo transactions with legacy insert.`);
    console.log("Purchased offers:", offers.map((offer) => offer.name).join(", "));
    return;
  }

  if (rpcError) throw rpcError;

  console.log(`Seeded ${txs?.length ?? 0} demo transactions for ${customerEmail}.`);
  console.log("Purchased offers:", offers.map((offer) => offer.name).join(", "));
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
