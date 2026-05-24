import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase URL or publishable key.");
}

const accounts = [
  ["admin", "omar@example.com"],
  ["restaurant", "zaman@example.com"],
  ["customer", "customer@example.com"],
] as const;

async function main() {
  console.log("=== SELECTO DB READINESS ===");

  for (const [expectedRole, email] of accounts) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: "OmarSelecto2026",
    });

    if (authError || !auth.user) {
      console.log(`FAIL ${email}: ${authError?.message ?? "No user returned"}`);
      continue;
    }

    const { data: roles, error: roleError } = await supabase.rpc("get_my_roles");
    const roleNames = (roles ?? []).map((row: any) => row.role);
    const roleOk = roleNames.includes(expectedRole);

    const restaurants = await supabase.from("restaurants").select("id", { count: "exact", head: true });
    const ownedRestaurants = await supabase
      .from("restaurants")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", auth.user.id);
    const activeOffers = await supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("active", true);
    const transactions = await supabase.from("transactions").select("id", { count: "exact", head: true });

    console.log(email, {
      uid: auth.user.id,
      roleOk,
      roles: roleNames,
      roleError: roleError?.message,
      restaurants: restaurants.count,
      ownedRestaurants: ownedRestaurants.count,
      activeOffers: activeOffers.count,
      visibleTransactions: transactions.count,
    });
  }

  console.log("=== READINESS COMPLETE ===");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
