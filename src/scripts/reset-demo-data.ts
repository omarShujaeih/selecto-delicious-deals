import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedTarget = (process.env.SEED_TARGET || "").toLowerCase();
const allowProductionSeed = process.env.ALLOW_PRODUCTION_SEED === "1";

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const targetHost = new URL(url).hostname;
const isLocalTarget = targetHost === "localhost" || targetHost === "127.0.0.1";
const isSafeHostedTarget = seedTarget === "demo" || seedTarget === "staging";

if (!isLocalTarget && !isSafeHostedTarget && !allowProductionSeed) {
  console.error("Refusing to reset hosted data without SEED_TARGET=demo or SEED_TARGET=staging.");
  console.error("Set ALLOW_PRODUCTION_SEED=1 only if you intentionally want to seed production.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const demoPassword = "OmarSelecto2026";
const demoEmails = ["omar@example.com", "zaman@example.com", "burgers@example.com", "customer@example.com"] as const;

type DemoRestaurant = {
  id: string;
  ownerEmail: "zaman@example.com" | "burgers@example.com";
  name: string;
  cuisine: string;
  city: string;
  address: string;
  contact_email: string;
  phone_number: string;
  map_url: string;
  rating: number;
};

const demoRestaurants: DemoRestaurant[] = [
  ["00000000-2000-4000-8000-000000000001", "zaman@example.com", "زمن كافيه", "قهوة وفطور فلسطيني", "Ramallah", "الماصيون، رام الله", "zaman@example.com", "0599000001", "https://maps.google.com/?q=Zamn+Cafe+Ramallah", 4.8],
  ["00000000-2000-4000-8000-000000000002", "burgers@example.com", "برغر شارع ركب", "برغر ووجبات سريعة", "Ramallah", "شارع ركب، رام الله", "burgers@example.com", "0599000002", "https://maps.google.com/?q=Rukab+Street+Burgers+Ramallah", 4.7],
  ["00000000-2000-4000-8000-000000000003", "zaman@example.com", "منقوشة البلد", "مناقيش ومخبوزات", "Ramallah", "وسط رام الله", "manaqeesh@selecto.ps", "0599000003", "https://maps.google.com/?q=Ramallah+Manakeesh", 4.6],
  ["00000000-2000-4000-8000-000000000004", "burgers@example.com", "شاورما المنارة", "شاورما عربي", "Ramallah", "دوار المنارة، رام الله", "shawarma@selecto.ps", "0599000004", "https://maps.google.com/?q=Al+Manara+Shawarma+Ramallah", 4.7],
  ["00000000-2000-4000-8000-000000000005", "zaman@example.com", "كنافة نابلسية", "حلويات نابلسية", "Nablus", "البلدة القديمة، نابلس", "kunafa@selecto.ps", "0599000005", "https://maps.google.com/?q=Nablus+Kunafa", 4.9],
  ["00000000-2000-4000-8000-000000000006", "burgers@example.com", "مشاوي رفيديا", "مشاوي عربية", "Nablus", "رفيديا، نابلس", "rafidia@selecto.ps", "0599000006", "https://maps.google.com/?q=Rafidia+Grill+Nablus", 4.7],
  ["00000000-2000-4000-8000-000000000007", "zaman@example.com", "مشاوي الخليل", "كباب ومشاوي", "Hebron", "عين سارة، الخليل", "hebron.grill@selecto.ps", "0599000007", "https://maps.google.com/?q=Hebron+Grill", 4.8],
  ["00000000-2000-4000-8000-000000000008", "burgers@example.com", "مخبز الحرم", "مخبوزات ومناقيش", "Hebron", "قرب الحرم الإبراهيمي، الخليل", "haram.bakery@selecto.ps", "0599000008", "https://maps.google.com/?q=Al+Haram+Bakery+Hebron", 4.6],
  ["00000000-2000-4000-8000-000000000009", "zaman@example.com", "بيت لحم بايتس", "أكل فلسطيني وعالمي", "Bethlehem", "شارع المهد، بيت لحم", "bethlehem@selecto.ps", "0599000009", "https://maps.google.com/?q=Bethlehem+Bites", 4.6],
  ["00000000-2000-4000-8000-000000000010", "burgers@example.com", "أكلات القدس القديمة", "أكلات شعبية", "Jerusalem", "باب العامود، القدس", "jerusalem@selecto.ps", "0599000010", "https://maps.google.com/?q=Jerusalem+Old+City+Food", 4.9],
  ["00000000-2000-4000-8000-000000000011", "zaman@example.com", "جنين جرينز", "سلطات وأكل صحي", "Jenin", "شارع أبو بكر، جنين", "jenin.greens@selecto.ps", "0599000011", "https://maps.google.com/?q=Jenin+Greens", 4.5],
  ["00000000-2000-4000-8000-000000000012", "burgers@example.com", "كرم شاورما", "شاورما ووجبات", "Tulkarm", "شارع السكة، طولكرم", "karam@selecto.ps", "0599000012", "https://maps.google.com/?q=Karam+Shawarma+Tulkarm", 4.7],
  ["00000000-2000-4000-8000-000000000013", "zaman@example.com", "برغر قلقيلية", "برغر وبطاطا", "Qalqilya", "وسط البلد، قلقيلية", "qalqilya.burger@selecto.ps", "0599000013", "https://maps.google.com/?q=Qalqilya+Burger", 4.4],
  ["00000000-2000-4000-8000-000000000014", "burgers@example.com", "كافيه أريحا بالمز", "عصائر وقهوة", "Jericho", "شارع قصر هشام، أريحا", "jericho@selecto.ps", "0599000014", "https://maps.google.com/?q=Jericho+Palms+Cafe", 4.5],
  ["00000000-2000-4000-8000-000000000015", "zaman@example.com", "سلفيت بيتزا", "بيتزا ومعجنات", "Salfit", "وسط سلفيت", "salfit.pizza@selecto.ps", "0599000015", "https://maps.google.com/?q=Salfit+Pizza", 4.5],
  ["00000000-2000-4000-8000-000000000016", "burgers@example.com", "طابون طوباس", "طابون وفطائر", "Tubas", "شارع المدارس، طوباس", "tubas.taboon@selecto.ps", "0599000016", "https://maps.google.com/?q=Tubas+Taboon", 4.6],
  ["00000000-2000-4000-8000-000000000017", "zaman@example.com", "مندي البيرة", "رز ومندي", "Al-Bireh", "شارع الإرسال، البيرة", "bireh.mandi@selecto.ps", "0599000017", "https://maps.google.com/?q=Al+Bireh+Mandi", 4.6],
  ["00000000-2000-4000-8000-000000000018", "burgers@example.com", "حلويات غزة", "حلويات عربية", "Gaza", "الرمال، غزة", "gaza.sweets@selecto.ps", "0599000018", "https://maps.google.com/?q=Gaza+Sweets", 4.8],
].map(([id, ownerEmail, name, cuisine, city, address, contact_email, phone_number, map_url, rating]) => ({
  id,
  ownerEmail,
  name,
  cuisine,
  city,
  address,
  contact_email,
  phone_number,
  map_url,
  rating,
}));

const imageByCategory: Record<string, string> = {
  وجبات: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
  برغر: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  بيتزا: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  حلويات: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80",
  سوشي: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
};

type DemoOffer = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  cuisine: string;
  original_price: number;
  discounted_price: number;
  valid_until: string;
  prep_minutes: string;
  pickup_time: string;
  distance_km: number;
  rating: number;
  available_quantity: number;
  active: boolean;
};

const offerTemplates = [
  ["وجبة مشاوي فردية", "طبق مشاوي مع أرز وسلطة وخبز طابون.", "وجبات", "عربي", 55, 38, "5:00 PM - 8:30 PM"],
  ["سندويش شاورما عربي", "شاورما محمصة مع ثوم ومخلل وبطاطا.", "برغر", "شاورما", 32, 22, "4:00 PM - 9:00 PM"],
  ["منقوشة زعتر وجبنة", "مناقيش طازجة بزيت زيتون بلدي وجبنة بيضاء.", "بيتزا", "مخبوزات", 18, 12, "8:00 AM - 12:00 PM"],
  ["بوكس فلافل وحمص", "فلافل، حمص، مخللات وخبز ساخن.", "وجبات", "شعبي", 24, 16, "9:00 AM - 1:00 PM"],
  ["برغر كلاسيك كومبو", "برغر لحم مع بطاطا ومشروب.", "برغر", "عالمي", 42, 29, "5:00 PM - 10:00 PM"],
  ["بيتزا مارجريتا", "بيتزا جبنة وصلصة طماطم بعجينة طازجة.", "بيتزا", "إيطالي", 45, 31, "3:00 PM - 8:00 PM"],
  ["كنافة عائلية صغيرة", "كنافة نابلسية ساخنة بقطر خفيف.", "حلويات", "حلويات عربية", 35, 24, "4:00 PM - 8:00 PM"],
  ["كوب عصير أفوكادو", "أفوكادو طازج مع تمر ومكسرات.", "وجبات", "عصائر", 20, 14, "10:00 AM - 6:00 PM"],
  ["رول مسخن", "دجاج بالسماق والبصل بزيت زيتون داخل خبز طابون.", "وجبات", "فلسطيني", 36, 25, "12:00 PM - 4:00 PM"],
  ["سوشي نباتي", "رولات خفيفة بالخضار والأفوكادو.", "سوشي", "آسيوي", 48, 34, "2:00 PM - 7:00 PM"],
] as const;

const demoOffers: DemoOffer[] = demoRestaurants.flatMap((restaurant, restaurantIndex) =>
  Array.from({ length: 4 }, (_, offerIndex) => {
    const template = offerTemplates[(restaurantIndex + offerIndex) % offerTemplates.length];
    const [name, description, category, cuisine, originalPrice, restaurantPrice, pickupTime] = template;
    const idSuffix = String(restaurantIndex * 4 + offerIndex + 1).padStart(12, "0");
    const priceShift = (restaurantIndex + offerIndex) % 3;

    return {
      id: `10000000-2000-4000-8000-${idSuffix}`,
      restaurant_id: restaurant.id,
      name,
      description,
      image: imageByCategory[category],
      category,
      cuisine,
      original_price: originalPrice + priceShift,
      discounted_price: restaurantPrice + priceShift,
      valid_until: "اليوم، 10:00 مساءً",
      prep_minutes: `${15 + ((restaurantIndex + offerIndex) % 4) * 5} دقيقة`,
      pickup_time: pickupTime,
      distance_km: Number((0.4 + ((restaurantIndex + offerIndex) % 8) * 0.3).toFixed(1)),
      rating: restaurant.rating,
      available_quantity: 4 + ((restaurantIndex + offerIndex) % 9),
      active: (restaurantIndex + offerIndex) % 11 !== 0,
    };
  }),
);

async function findUser(email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((candidate) => candidate.email === email);
  if (!user) throw new Error(`Missing auth user: ${email}. Create it with password ${demoPassword} first.`);
  return user;
}

function seededTransactionRows(customerId: string) {
  const statuses = ["Pending", "Accepted", "Ready", "Completed", "Cancelled"] as const;
  return demoOffers.slice(0, 36).map((offer, index) => ({
    customer_id: customerId,
    restaurant_id: offer.restaurant_id,
    offer_id: offer.id,
    sale_amount: offer.discounted_price,
    restaurant_price: offer.discounted_price,
    status: statuses[index % statuses.length],
    created_at: new Date(Date.now() - index * 3 * 60 * 60 * 1000).toISOString(),
  }));
}

async function main() {
  console.log(`Resetting Selecto demo data on ${isLocalTarget ? "local" : seedTarget || targetHost}...`);

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

  const restaurantIds = demoRestaurants.map((restaurant) => restaurant.id);
  const offerIds = demoOffers.map((offer) => offer.id);

  await admin.from("transactions").delete().in("restaurant_id", restaurantIds);
  await admin.from("offers").delete().in("id", offerIds);
  await admin.from("restaurants").delete().in("id", restaurantIds);

  await admin.from("user_roles").delete().in("user_id", [omar.id, zaman.id, burgers.id, customer.id]);
  await admin.from("user_roles").insert([
    { user_id: omar.id, role: "admin" },
    { user_id: zaman.id, role: "restaurant" },
    { user_id: burgers.id, role: "restaurant" },
    { user_id: customer.id, role: "customer" },
  ]);

  const { error: restaurantError } = await admin.from("restaurants").upsert(
    demoRestaurants.map(({ ownerEmail, ...restaurant }) => ({
      ...restaurant,
      owner_id: usersByEmail.get(ownerEmail)!.id,
      active: true,
    })),
    { onConflict: "id" },
  );
  if (restaurantError) throw restaurantError;

  const { error: offerError } = await admin.from("offers").upsert(
    demoOffers.map((offer) => ({
      ...offer,
      image: imageByCategory[offer.category],
    })),
    { onConflict: "id" },
  );
  if (offerError) throw offerError;

  const { error: transactionError } = await admin.from("transactions").insert(seededTransactionRows(customer.id));
  if (transactionError) throw transactionError;

  console.log(`Demo data reset complete: ${demoRestaurants.length} restaurants, ${demoOffers.length} offers, 36 transactions.`);
  console.log("Demo password for existing accounts:", demoPassword);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
