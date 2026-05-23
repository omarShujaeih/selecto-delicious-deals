import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

async function testCheckout() {
  console.log("=== CHECKOUT FLOW TEST ===\n");

  const supabase = createClient(supabaseUrl!, supabaseKey!, {
    auth: { persistSession: false },
  });

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "customer@example.com",
    password: "OmarSelecto2026",
  });

  if (authError) {
    console.error("❌ Customer login failed:", authError.message);
    process.exit(1);
  }
  console.log("✅ Customer signed in:", authData.user?.id);

  const { data: offers, error: offersErr } = await supabase
    .from("offers")
    .select("id, name, discounted_price, restaurant_id, active")
    .eq("active", true)
    .limit(1);

  if (offersErr || !offers || offers.length === 0) {
    console.error("❌ No active offers found:", offersErr?.message);
    process.exit(1);
  }

  const offer = offers[0];
  console.log(`✅ Found active offer: "${offer.name}" (₪${offer.discounted_price}), restaurant: ${offer.restaurant_id}`);

  const restaurantPrice = Number(offer.discounted_price);
  console.log(`\n📝 Inserting transaction with restaurant_price: ₪${restaurantPrice}`);

  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .insert({
      customer_id: authData.user!.id,
      offer_id: offer.id,
      restaurant_id: offer.restaurant_id,
      restaurant_price: restaurantPrice,
      sale_amount: restaurantPrice,
    })
    .select()
    .single();

  if (txErr) {
    console.error("❌ Transaction insert FAILED:", txErr.message);
    console.error("   Code:", txErr.code);
    console.error("   Details:", txErr.details);
    console.error("   Hint:", txErr.hint);
    process.exit(1);
  }

  console.log("\n✅ Transaction created successfully!");
  console.log(`   Transaction ID: ${tx.id}`);
  console.log(`   restaurant_price: ₪${tx.restaurant_price}`);
  console.log(`   commission_rate: ${tx.commission_rate}`);
  console.log(`   commission_amount: ₪${tx.commission_amount}`);
  console.log(`   customer_total_price: ₪${tx.customer_total_price}`);
  console.log(`   restaurant_payout: ₪${tx.restaurant_payout}`);
  console.log(`   status: ${tx.status}`);

  const expectedCommission = Number((restaurantPrice * 0.20).toFixed(2));
  const expectedTotal = restaurantPrice + expectedCommission;

  const commOk = Number(tx.commission_amount) === expectedCommission;
  const totalOk = Number(tx.customer_total_price) === expectedTotal;
  const payoutOk = Number(tx.restaurant_payout) === restaurantPrice;

  console.log("\n📊 Commission verification:");
  console.log(`   Commission (expected ₪${expectedCommission}): ${commOk ? "✅" : "❌"} got ₪${tx.commission_amount}`);
  console.log(`   Total (expected ₪${expectedTotal}): ${totalOk ? "✅" : "❌"} got ₪${tx.customer_total_price}`);
  console.log(`   Payout (expected ₪${restaurantPrice}): ${payoutOk ? "✅" : "❌"} got ₪${tx.restaurant_payout}`);

  console.log("\n=== CHECKOUT FLOW TEST COMPLETED ===");
}

testCheckout().catch((e) => {
  console.error("💥 Unexpected error:", e);
  process.exit(1);
});
