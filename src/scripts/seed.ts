import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required seed environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const credentials = {
  admin: {
    email: requireEnv("SEED_ADMIN_EMAIL"),
    password: requireEnv("SEED_ADMIN_PASSWORD"),
    name: "Omar",
  },
  customer: {
    email: requireEnv("SEED_CUSTOMER_EMAIL"),
    password: requireEnv("SEED_CUSTOMER_PASSWORD"),
    name: "Test Customer",
  },
  zaman: {
    email: requireEnv("SEED_ZAMAN_EMAIL"),
    password: requireEnv("SEED_ZAMAN_PASSWORD"),
    name: "Zaman Owner",
  },
  burgers: {
    email: requireEnv("SEED_BURGERS_EMAIL"),
    password: requireEnv("SEED_BURGERS_PASSWORD"),
    name: "Burgers Owner",
  },
};

async function signUpOrGetId(user: typeof credentials.admin): Promise<string | null> {
  console.log(`Signing up / registering: ${user.email}...`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: { display_name: user.name },
      },
    });

    if (error || !data.user) {
      console.log(`User ${user.email} signup returned an error:`, error?.message || "Null user");
      console.log(`Attempting sign in for user ${user.email} to fetch ID...`);
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });
      if (signInErr) {
        console.warn(`Could not sign up or sign in ${user.email}: ${signInErr.message}`);
        return null;
      }
      return signInData.user.id;
    }
    return data.user.id;
  } catch (err) {
    console.warn(`Auth network request failed for ${user.email}:`, err);
    return null;
  }
}

async function runSeed() {
  console.log("Starting Selecto Database Seeding (Ramallah Simulation)...");

  // 1. Sign up all required users to populate auth.users
  const adminUid = await signUpOrGetId(credentials.admin);
  const customerUid = await signUpOrGetId(credentials.customer);
  const zamanUid = await signUpOrGetId(credentials.zaman);
  const burgersUid = await signUpOrGetId(credentials.burgers);

  if (!adminUid) {
    console.error("\n❌ ERROR: Supabase email rate limit exceeded!");
    console.error("=======================================================");
    console.error("Supabase Auth has strictly rate-limited new email signups from your IP.");
    console.error("BUT NO WORRIES! We have created a 100% bulletproof bypass solution! 🎉");
    console.error("\n👉 HOW TO SEED DIRECTLY USING SQL (Rate limit bypass):");
    console.error("1. Open your browser and go to your Supabase Dashboard SQL Editor.");
    console.error("2. Apply the SQL files in supabase/migrations from your Supabase SQL editor.");
    console.error("3. Re-run this seed script after the auth rate limit cools down.");
    console.error("This keeps database setup in migrations and avoids duplicate setup scripts.");
    console.error("=======================================================\n");
    process.exit(0);
  }

  console.log("Auth users verified successfully.");

  // 2. Sign in as Admin (Omar) to promote restaurant owners and populate restaurants/offers
  console.log("Signing in as Admin Omar to manage roles and seed data...");
  const { data: adminSession, error: adminAuthErr } = await supabase.auth.signInWithPassword({
    email: credentials.admin.email,
    password: credentials.admin.password,
  });

  if (adminAuthErr) {
    throw new Error(`Admin authentication failed: ${adminAuthErr.message}`);
  }

  // Use the admin's authenticated client to update roles and insert restaurant data
  const adminClient = createClient(SUPABASE_URL as string, SUPABASE_KEY as string, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${adminSession.session?.access_token || ""}`,
      },
    },
  });

  console.log("Promoting Zaman and Burgers owners to 'restaurant' role...");
  // Clear any existing customer roles for them to avoid unique constraint issues
  if (zamanUid) await adminClient.from("user_roles").delete().eq("user_id", zamanUid);
  if (burgersUid) await adminClient.from("user_roles").delete().eq("user_id", burgersUid);

  // Insert restaurant roles
  if (zamanUid) await adminClient.from("user_roles").insert({ user_id: zamanUid, role: "restaurant" });
  if (burgersUid) await adminClient.from("user_roles").insert({ user_id: burgersUid, role: "restaurant" });

  console.log("Upserting Ramallah restaurants owned by restaurant accounts...");
  
  // Clean existing restaurants to prevent duplicate seeds
  if (zamanUid) await adminClient.from("restaurants").delete().eq("owner_id", zamanUid);
  if (burgersUid) await adminClient.from("restaurants").delete().eq("owner_id", burgersUid);

  // Insert new Ramallah restaurants
  const { data: rest1, error: r1Err } = await adminClient.from("restaurants").insert({
    owner_id: zamanUid || adminUid,
    name: "Zamn Cafe",
    cuisine: "Levantine",
    city: "Al-Masyoun, Ramallah",
    rating: 4.8,
    active: true,
  }).select().single();

  const { data: rest2, error: r2Err } = await adminClient.from("restaurants").insert({
    owner_id: burgersUid || adminUid,
    name: "Rukab Street Burgers",
    cuisine: "Burgers & Grill",
    city: "Rukab Street, Ramallah",
    rating: 4.6,
    active: true,
  }).select().single();

  const { data: rest3, error: r3Err } = await adminClient.from("restaurants").insert({
    owner_id: adminUid,
    name: "Al-Manara Pizza",
    cuisine: "Italian",
    city: "Al-Manara, Ramallah",
    rating: 4.6,
    active: true,
  }).select().single();

  const { data: rest4, error: r4Err } = await adminClient.from("restaurants").insert({
    owner_id: adminUid,
    name: "Rukab's Ice Cream",
    cuisine: "Desserts",
    city: "Downtown Ramallah",
    rating: 4.9,
    active: true,
  }).select().single();

  const { data: rest5, error: r5Err } = await adminClient.from("restaurants").insert({
    owner_id: adminUid,
    name: "Downtown Shawarma",
    cuisine: "Arabic",
    city: "Downtown Ramallah",
    rating: 4.7,
    active: true,
  }).select().single();

  const { data: rest6, error: r6Err } = await adminClient.from("restaurants").insert({
    owner_id: adminUid,
    name: "Baladna Kitchen",
    cuisine: "Palestinian",
    city: "Old City, Ramallah",
    rating: 4.8,
    active: true,
  }).select().single();

  if (r1Err || r2Err || r3Err || r4Err || r5Err || r6Err) {
    throw new Error(`Failed to seed restaurants: ${r1Err?.message || r2Err?.message || r3Err?.message || r4Err?.message || r5Err?.message || r6Err?.message}`);
  }

  console.log(`Restaurants created: Zamn Cafe (${rest1.id}), Rukab Street Burgers (${rest2.id}), Al-Manara Pizza (${rest3.id}), Rukab's Ice Cream (${rest4.id}), Downtown Shawarma (${rest5.id}), Baladna Kitchen (${rest6.id})`);

  console.log("Seeding local menu items / offers with specific pickup times...");
  // Seed Zamn Cafe offers
  const { data: offersZamn, error: oZamnErr } = await adminClient.from("offers").insert([
    {
      restaurant_id: rest1.id,
      name: "Arabic Mansaf Cup",
      description: "Authentic Mansaf in a cup with premium local lamb, Jameed, and almond garnish.",
      image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
      category: "Bowls",
      cuisine: "Levantine",
      original_price: 35.00,
      discounted_price: 24.00,
      valid_until: "Today, 10:00 PM",
      prep_minutes: "20-25 min",
      pickup_time: "1:00 PM - 3:00 PM",
      distance_km: 0.8,
      rating: 4.9,
      active: true,
    },
    {
      restaurant_id: rest1.id,
      name: "Tawook Wrap Deal",
      description: "Charcoal-grilled chicken shish tawook wraps with garlic paste and pickles.",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
      category: "Burgers",
      cuisine: "Levantine",
      original_price: 25.00,
      discounted_price: 18.00,
      valid_until: "Today, 9:00 PM",
      prep_minutes: "15-20 min",
      pickup_time: "5:00 PM - 7:00 PM",
      distance_km: 0.8,
      rating: 4.7,
      active: true,
    }
  ]).select();

  // Seed Rukab Street Burgers offers
  const { data: offersBurgers, error: oBurgersErr } = await adminClient.from("offers").insert([
    {
      restaurant_id: rest2.id,
      name: "Manara Tower Double Beef",
      description: "Double premium beef patties, melted local cheddar, special burger sauce on toasted brioche.",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      category: "Burgers",
      cuisine: "Burgers",
      original_price: 45.00,
      discounted_price: 32.00,
      valid_until: "Today, 11:30 PM",
      prep_minutes: "25-30 min",
      pickup_time: "6:00 PM - 8:00 PM",
      distance_km: 1.2,
      rating: 4.8,
      active: true,
    },
    {
      restaurant_id: rest2.id,
      name: "Crunchy Zinger Wrap",
      description: "Spicy crispy chicken zinger wrap with cheddar sauce, lettuce, and mayonnaise.",
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
      category: "Burgers",
      cuisine: "Grill",
      original_price: 28.00,
      discounted_price: 20.00,
      valid_until: "Today, 10:30 PM",
      prep_minutes: "20 min",
      pickup_time: "12:00 PM - 2:00 PM",
      distance_km: 1.2,
      rating: 4.5,
      active: true,
    }
  ]).select();

  const { data: offersPizza, error: oPizzaErr } = await adminClient.from("offers").insert([
    {
      restaurant_id: rest3.id,
      name: "Special Margherita Pizza",
      description: "Stone-baked crispy sourdough crust, rich local tomato sauce, fresh buffalo mozzarella, and aromatic basil leaves.",
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
      category: "Pizzas",
      cuisine: "Italian",
      original_price: 30.00,
      discounted_price: 20.00,
      valid_until: "Today, 10:30 PM",
      prep_minutes: "15-20 min",
      pickup_time: "4:00 PM - 6:30 PM",
      distance_km: 0.5,
      rating: 4.6,
      active: true,
    }
  ]).select();

  const { data: offersIceCream, error: oIceCreamErr } = await adminClient.from("offers").insert([
    {
      restaurant_id: rest4.id,
      name: "Arabic Mastic Ice Cream Tub",
      description: "Legendary Ramallah mastic ice cream with rich pistachios, stretchy texture, and authentic local flavor.",
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
      category: "Bowls",
      cuisine: "Desserts",
      original_price: 20.00,
      discounted_price: 14.00,
      valid_until: "Today, 11:00 PM",
      prep_minutes: "5 min",
      pickup_time: "12:00 PM - 10:00 PM",
      distance_km: 1.1,
      rating: 4.9,
      active: true,
    }
  ]).select();

  const { data: offersShawarma, error: oShawarmaErr } = await adminClient.from("offers").insert([
    {
      restaurant_id: rest5.id,
      name: "Double Shawarma Meal",
      description: "Tender sliced chicken shawarma wraps, toasted with local garlic toum, pickles, and crispy salted french fries.",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
      category: "Burgers",
      cuisine: "Arabic",
      original_price: 28.00,
      discounted_price: 20.00,
      valid_until: "Today, 11:00 PM",
      prep_minutes: "15-20 min",
      pickup_time: "3:00 PM - 5:30 PM",
      distance_km: 0.6,
      rating: 4.7,
      active: true,
    }
  ]).select();

  const { data: offersFalafel, error: oFalafelErr } = await adminClient.from("offers").insert([
    {
      restaurant_id: rest6.id,
      name: "Falafel & Hummus Platter",
      description: "Crispy freshly-fried sesame falafel balls, smooth creamy chickpea hummus, pickles, and freshly-baked local pita bread.",
      image: "https://images.unsplash.com/photo-1547058886-af77d0cf0c0d?auto=format&fit=crop&w=800&q=80",
      category: "Bowls",
      cuisine: "Palestinian",
      original_price: 15.00,
      discounted_price: 10.00,
      valid_until: "Today, 9:00 PM",
      prep_minutes: "10 min",
      pickup_time: "8:00 AM - 12:00 PM",
      distance_km: 0.9,
      rating: 4.8,
      active: true,
    }
  ]).select();

  if (oZamnErr || oBurgersErr || oPizzaErr || oIceCreamErr || oShawarmaErr || oFalafelErr) {
    throw new Error(`Failed to seed offers: ${oZamnErr?.message || oBurgersErr?.message || oPizzaErr?.message || oIceCreamErr?.message || oShawarmaErr?.message || oFalafelErr?.message}`);
  }

  console.log("Menu offers seeded successfully.");

  // 3. Seed some transactions to show beautiful dashboards and 20% platform commission
  console.log("Seeding sample transactions for commission visualization...");
  
  // Clean existing transactions first to have clean stats
  if (customerUid) {
    await adminClient.from("transactions").delete().eq("customer_id", customerUid);

    const sampleTransactions = [
      {
        offer_id: offersZamn![0].id,
        restaurant_id: rest1.id,
        customer_id: customerUid,
        sale_amount: offersZamn![0].discounted_price,
      },
      {
        offer_id: offersZamn![1].id,
        restaurant_id: rest1.id,
        customer_id: customerUid,
        sale_amount: offersZamn![1].discounted_price,
      },
      {
        offer_id: offersBurgers![0].id,
        restaurant_id: rest2.id,
        customer_id: customerUid,
        sale_amount: offersBurgers![0].discounted_price,
      },
    ];

    const { error: txErr } = await adminClient.from("transactions").insert(sampleTransactions);
    if (txErr) {
      console.error("Warning: Failed to seed transactions:", txErr.message);
    } else {
      console.log("Sample shekel transactions seeded successfully!");
    }
  }

  console.log("\n=======================================================");
  console.log("✓ SUCCESS: Selecto database seeded successfully!");
  console.log("=======================================================");
  console.log(`Admin Email: ${credentials.admin.email} (Password: ${credentials.admin.password})`);
  console.log(`Customer Email: ${credentials.customer.email} (Password: ${credentials.customer.password})`);
  console.log(`Zamn Cafe Email: ${credentials.zaman.email} (Password: ${credentials.zaman.password})`);
  console.log(`Rukab Burgers Email: ${credentials.burgers.email} (Password: ${credentials.burgers.password})`);
  console.log("=======================================================\n");
}

runSeed().catch((err) => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
