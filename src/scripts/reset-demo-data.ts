import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Apply supabase/migrations/20260523000200_reset_selecto_demo.sql in Supabase SQL Editor instead.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const demoRestaurants = [
  {
    id: "00000000-1000-4000-8000-000000000001",
    ownerEmail: "zaman@example.com",
    name: "Zamn Cafe",
    cuisine: "Cafe / Palestinian",
    city: "Ramallah",
    address: "Al-Masyoun, Ramallah",
    contact_email: "zaman@example.com",
  },
  {
    id: "00000000-1000-4000-8000-000000000002",
    ownerEmail: "burgers@example.com",
    name: "Rukab Street Burgers",
    cuisine: "Burgers",
    city: "Ramallah",
    address: "Rukab Street, Ramallah",
    contact_email: "burgers@example.com",
  },
] as const;

const demoOffers = [
  ["10000000-1000-4000-8000-000000000001", demoRestaurants[0].id, "Arabic Mansaf Cup", "Warm mansaf rice cup with jameed sauce.", "Bowls", "Arabic", 32, 24, "Today, 9:00 PM", "20 min"],
  ["10000000-1000-4000-8000-000000000002", demoRestaurants[0].id, "Falafel Hummus Box", "Falafel, hummus, pickles, and pita.", "Bowls", "Palestinian", 24, 16, "Today, 6:00 PM", "15 min"],
  ["10000000-1000-4000-8000-000000000003", demoRestaurants[1].id, "Classic Beef Burger", "Beef burger with fries.", "Burgers", "International", 38, 25, "Today, 10:00 PM", "20 min"],
  ["10000000-1000-4000-8000-000000000004", demoRestaurants[1].id, "Chicken Burger Combo", "Crispy chicken burger with fries.", "Burgers", "International", 36, 22, "Today, 10:00 PM", "20 min"],
] as const;

async function findUser(email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((candidate) => candidate.email === email);
  if (!user) throw new Error(`Missing auth user: ${email}`);
  return user;
}

async function main() {
  const omar = await findUser("omar@example.com");
  const zaman = await findUser("zaman@example.com");
  const burgers = await findUser("burgers@example.com");
  const customer = await findUser("customer@example.com");
  const usersByEmail = new Map([
    ["omar@example.com", omar],
    ["zaman@example.com", zaman],
    ["burgers@example.com", burgers],
    ["customer@example.com", customer],
  ]);

  await admin.from("transactions").delete().in("restaurant_id", demoRestaurants.map((r) => r.id));
  await admin.from("offers").delete().in("restaurant_id", demoRestaurants.map((r) => r.id));
  await admin.from("restaurants").delete().in("id", demoRestaurants.map((r) => r.id));

  await admin.from("user_roles").delete().in("user_id", [omar.id, zaman.id, burgers.id, customer.id]);
  await admin.from("user_roles").insert([
    { user_id: omar.id, role: "admin" },
    { user_id: zaman.id, role: "restaurant" },
    { user_id: burgers.id, role: "restaurant" },
    { user_id: customer.id, role: "customer" },
  ]);

  await admin.from("restaurants").upsert(
    demoRestaurants.map(({ ownerEmail, ...restaurant }) => ({
      ...restaurant,
      owner_id: usersByEmail.get(ownerEmail)!.id,
      active: true,
      rating: 4.8,
    })),
    { onConflict: "id" },
  );

  await admin.from("offers").upsert(
    demoOffers.map(([id, restaurant_id, name, description, category, cuisine, original_price, discounted_price, valid_until, prep_minutes]) => ({
      id,
      restaurant_id,
      name,
      description,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
      category,
      cuisine,
      original_price,
      discounted_price,
      valid_until,
      prep_minutes,
      pickup_time: "5:00 PM - 8:00 PM",
      distance_km: 1.2,
      rating: 4.8,
      active: true,
    })),
    { onConflict: "id" },
  );

  await admin.from("transactions").insert([
    { customer_id: customer.id, restaurant_id: demoRestaurants[0].id, offer_id: demoOffers[0][0], sale_amount: demoOffers[0][7] },
    { customer_id: customer.id, restaurant_id: demoRestaurants[1].id, offer_id: demoOffers[2][0], sale_amount: demoOffers[2][7] },
  ]);

  console.log("Demo data reset complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
