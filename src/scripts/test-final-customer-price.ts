import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey) {
  throw new Error("Missing Supabase URL or publishable key.");
}

const TEST_RESTAURANT_ID = "00000000-3000-4000-8000-000000000001";
const PRICE_OFFER_ID = "10000000-3000-4000-8000-000000000001";
const STOCK_OFFER_ID = "10000000-3000-4000-8000-000000000002";

const admin = serviceKey ? createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
}) : null;

const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findAuthUser(email: string) {
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for deterministic checkout setup.");
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((candidate) => candidate.email === email);
  if (!user) throw new Error(`Missing auth user: ${email}`);
  return user;
}

async function setup() {
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for deterministic checkout setup.");
  const owner = await findAuthUser("zaman@example.com");

  await admin.from("transactions").delete().eq("restaurant_id", TEST_RESTAURANT_ID);
  await admin.from("offers").delete().in("id", [PRICE_OFFER_ID, STOCK_OFFER_ID]);
  await admin.from("restaurants").delete().eq("id", TEST_RESTAURANT_ID);

  const { error: restaurantError } = await admin.from("restaurants").insert({
    id: TEST_RESTAURANT_ID,
    owner_id: owner.id,
    name: "Selecto Checkout Test",
    cuisine: "Test",
    city: "Ramallah",
    active: true,
    rating: 4.9,
  });
  if (restaurantError) throw restaurantError;

  const { error: offerError } = await admin.from("offers").insert([
    {
      id: PRICE_OFFER_ID,
      restaurant_id: TEST_RESTAURANT_ID,
      name: "Price Guard Meal",
      description: "Temporary checkout pricing test offer.",
      category: "وجبات",
      cuisine: "Test",
      original_price: 36,
      discounted_price: 24,
      pickup_time: "5:00 PM - 8:00 PM",
      available_quantity: 4,
      active: true,
    },
    {
      id: STOCK_OFFER_ID,
      restaurant_id: TEST_RESTAURANT_ID,
      name: "Stock Guard Meal",
      description: "Temporary stock guard test offer.",
      category: "وجبات",
      cuisine: "Test",
      original_price: 30,
      discounted_price: 20,
      pickup_time: "5:00 PM - 8:00 PM",
      available_quantity: 1,
      active: true,
    },
  ]);
  if (offerError) throw offerError;
}

async function cleanup() {
  if (!admin) return;
  await admin.from("transactions").delete().eq("restaurant_id", TEST_RESTAURANT_ID);
  await admin.from("offers").delete().in("id", [PRICE_OFFER_ID, STOCK_OFFER_ID]);
  await admin.from("restaurants").delete().eq("id", TEST_RESTAURANT_ID);
}

function assertMoney(actual: number | null, expected: number, label: string) {
  if (Number(actual) !== expected) {
    throw new Error(`Expected ${label} ${expected}, got ${actual}`);
  }
}

async function main() {
  if (!admin) {
    await fallbackLiveDataCheck();
    return;
  }

  await setup();

  try {
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
      email: "customer@example.com",
      password: "OmarSelecto2026",
    });
    if (authError || !auth.user) throw authError ?? new Error("Customer login failed.");

    const { data: priceTxs, error: priceError } = await supabase.rpc("place_order", {
      _items: [{ offerId: PRICE_OFFER_ID, quantity: 2 }],
    });
    if (priceError) throw priceError;
    if (priceTxs?.length !== 2) throw new Error(`Expected 2 transactions, got ${priceTxs?.length ?? 0}.`);

    const transactionIds = priceTxs.map((tx) => tx.transaction_id);
    const { data: transactions, error: transactionError } = await supabase
      .from("transactions")
      .select("id, restaurant_price, commission_rate, commission_amount, customer_total_price, restaurant_payout")
      .in("id", transactionIds);
    if (transactionError) throw transactionError;
    if (transactions?.length !== 2) throw new Error(`Expected to read 2 transactions, got ${transactions?.length ?? 0}.`);

    for (const tx of transactions) {
      assertMoney(tx.restaurant_price, 24, "restaurant_price");
      assertMoney(tx.commission_rate, 0.2, "commission_rate");
      assertMoney(tx.commission_amount, 4.8, "commission_amount");
      assertMoney(tx.customer_total_price, 28.8, "customer_total_price");
      assertMoney(tx.restaurant_payout, 24, "restaurant_payout");
    }

    const { data: priceOffer, error: priceOfferError } = await admin
      .from("offers")
      .select("available_quantity, active")
      .eq("id", PRICE_OFFER_ID)
      .single();
    if (priceOfferError) throw priceOfferError;
    if (priceOffer.available_quantity !== 2 || priceOffer.active !== true) {
      throw new Error(`Expected price test offer to have quantity 2 and remain active, got ${JSON.stringify(priceOffer)}.`);
    }

    const { error: stockError } = await supabase.rpc("place_order", {
      _items: [{ offerId: STOCK_OFFER_ID, quantity: 2 }],
    });
    if (!stockError) throw new Error("Expected stock guard order to fail.");
    if (!stockError.message.includes("no longer available")) {
      throw new Error(`Expected stock guard error, got: ${stockError.message}`);
    }

    console.log(JSON.stringify({
      checked: "checkout pricing, quantity decrement, stock guard",
      restaurant_price: 24,
      commission_amount: 4.8,
      customer_total_price: 28.8,
      restaurant_payout: 24,
      quantity_after_order: priceOffer.available_quantity,
    }, null, 2));
  } finally {
    await cleanup();
  }
}

async function fallbackLiveDataCheck() {
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: "customer@example.com",
    password: "OmarSelecto2026",
  });
  if (authError || !auth.user) throw authError ?? new Error("Customer login failed.");

  const { data: offers, error: offerError } = await supabase
    .from("offers")
    .select("id, name, discounted_price")
    .eq("active", true)
    .limit(1);
  if (offerError) throw offerError;
  if (!offers?.length) throw new Error("No active offer with available quantity found.");

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

  const restaurantPrice = Number(offer.discounted_price);
  const expectedCommission = Number((restaurantPrice * 0.2).toFixed(2));
  const expectedTotal = restaurantPrice + expectedCommission;

  assertMoney(tx.restaurant_price, restaurantPrice, "restaurant_price");
  assertMoney(tx.commission_rate, 0.2, "commission_rate");
  assertMoney(tx.commission_amount, expectedCommission, "commission_amount");
  assertMoney(tx.customer_total_price, expectedTotal, "customer_total_price");
  assertMoney(tx.restaurant_payout, restaurantPrice, "restaurant_payout");

  console.log(JSON.stringify({
    checked: "checkout pricing fallback on existing data",
    offer: offer.name,
    restaurant_price: restaurantPrice,
    commission_amount: expectedCommission,
    customer_total_price: expectedTotal,
    restaurant_payout: restaurantPrice,
    note: "Set SUPABASE_SERVICE_ROLE_KEY to also run deterministic quantity and stock guard checks.",
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
