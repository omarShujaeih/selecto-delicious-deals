import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type SeedRestaurant = {
  name: string;
  city: string;
  area: string;
  cuisine: string;
  contact_email: string;
  phone_number: string;
  rating: number;
};

const restaurantsData: SeedRestaurant[] = [
  // Ramallah
  { name: "Orjuwan Lounge", city: "Ramallah", area: "Al-Masyoun", cuisine: "Italian & International", contact_email: "demo+orjuwan@selecto.ps", phone_number: "+970590000001", rating: 4.8 },
  { name: "Azure Restaurant", city: "Ramallah", area: "Al-Tireh", cuisine: "Fine Dining", contact_email: "demo+azure@selecto.ps", phone_number: "+970590000002", rating: 4.7 },
  { name: "Vanilla Cafe", city: "Ramallah", area: "Al-Irsal", cuisine: "Cafe & Desserts", contact_email: "demo+vanilla@selecto.ps", phone_number: "+970590000003", rating: 4.6 },
  { name: "Capers Cafe", city: "Ramallah", area: "Downtown Ramallah", cuisine: "Cafe", contact_email: "demo+capers@selecto.ps", phone_number: "+970590000004", rating: 4.5 },
  { name: "La Grotta Cafe", city: "Ramallah", area: "Ein Misbah", cuisine: "Cafe & Snacks", contact_email: "demo+lagrotta@selecto.ps", phone_number: "+970590000005", rating: 4.6 },
  { name: "Al Riwaq Restaurant", city: "Ramallah", area: "Al-Manara", cuisine: "Middle Eastern", contact_email: "demo+alriwaq@selecto.ps", phone_number: "+970590000006", rating: 4.8 },
  { name: "Bahri Restaurant", city: "Ramallah", area: "Al-Masyoun", cuisine: "Seafood", contact_email: "demo+bahri@selecto.ps", phone_number: "+970590000007", rating: 4.7 },
  { name: "Khamees Restaurant", city: "Ramallah", area: "Al-Bireh", cuisine: "Middle Eastern", contact_email: "demo+khamees@selecto.ps", phone_number: "+970590000008", rating: 4.5 },
  { name: "Meat Moot Ramallah", city: "Ramallah", area: "Al-Tireh", cuisine: "Steakhouse", contact_email: "demo+meatmoot@selecto.ps", phone_number: "+970590000009", rating: 4.9 },
  { name: "Mozaic Ramallah", city: "Ramallah", area: "Rukab Street", cuisine: "International", contact_email: "demo+mozaic@selecto.ps", phone_number: "+970590000010", rating: 4.4 },
  
  // Nablus
  { name: "Pardo Cafe", city: "Nablus", area: "Rafidia", cuisine: "Cafe & International", contact_email: "demo+pardo@selecto.ps", phone_number: "+970590000011", rating: 4.7 },
  { name: "Veranda Cafe & Cultural Space", city: "Nablus", area: "City Center", cuisine: "Cafe", contact_email: "demo+veranda@selecto.ps", phone_number: "+970590000012", rating: 4.8 },
  { name: "Nosha Cafe", city: "Nablus", area: "Faisal Street", cuisine: "Cafe & Snacks", contact_email: "demo+nosha@selecto.ps", phone_number: "+970590000013", rating: 4.5 },
  { name: "Cedarz Gelato & Coffee House", city: "Nablus", area: "Al-Makhfiya", cuisine: "Desserts & Coffee", contact_email: "demo+cedarz@selecto.ps", phone_number: "+970590000014", rating: 4.9 },
  { name: "90s Burger", city: "Nablus", area: "Rafidia", cuisine: "Burgers", contact_email: "demo+90sburger@selecto.ps", phone_number: "+970590000015", rating: 4.6 },
  { name: "Bait Al Karama", city: "Nablus", area: "Old City", cuisine: "Traditional Palestinian", contact_email: "demo+baitalkarama@selecto.ps", phone_number: "+970590000016", rating: 4.8 },
  { name: "Alf Laylat W Laylat Nablus", city: "Nablus", area: "City Center", cuisine: "Middle Eastern", contact_email: "demo+alflaylat@selecto.ps", phone_number: "+970590000017", rating: 4.4 },
  { name: "Nablus Old Souq Bites", city: "Nablus", area: "Old City", cuisine: "Street Food", contact_email: "demo+nablusbites@selecto.ps", phone_number: "+970590000018", rating: 4.7 },

  // Hebron
  { name: "Zuwwar Restaurant", city: "Hebron", area: "Ein Sarah", cuisine: "Middle Eastern", contact_email: "demo+zuwwar@selecto.ps", phone_number: "+970590000019", rating: 4.8 },
  { name: "Qasr Al Basha", city: "Hebron", area: "University Street", cuisine: "Traditional Palestinian", contact_email: "demo+qasralbasha@selecto.ps", phone_number: "+970590000020", rating: 4.7 },
  { name: "Hakayet Bahr", city: "Hebron", area: "Ein Sarah", cuisine: "Seafood", contact_email: "demo+hakayetbahr@selecto.ps", phone_number: "+970590000021", rating: 4.6 },
  { name: "Al Salam Grill Restaurant", city: "Hebron", area: "Wadi Al-Hariya", cuisine: "Grill & Kebab", contact_email: "demo+alsalam@selecto.ps", phone_number: "+970590000022", rating: 4.9 },
  { name: "Shawarma Akram", city: "Hebron", area: "Old City", cuisine: "Shawarma", contact_email: "demo+akram@selecto.ps", phone_number: "+970590000023", rating: 4.8 },
  { name: "Ras Al Joura Grill", city: "Hebron", area: "Ras Al-Joura", cuisine: "Grill", contact_email: "demo+rasaljoura@selecto.ps", phone_number: "+970590000024", rating: 4.7 },
  { name: "Hebron Old City Kitchen", city: "Hebron", area: "Old City", cuisine: "Traditional", contact_email: "demo+hebronkitchen@selecto.ps", phone_number: "+970590000025", rating: 4.9 },

  // Bethlehem
  { name: "Afteem Restaurant", city: "Bethlehem", area: "Manger Street", cuisine: "Falafel & Hummus", contact_email: "demo+afteem@selecto.ps", phone_number: "+970590000026", rating: 4.9 },
  { name: "Abu Shanab", city: "Bethlehem", area: "Beit Jala", cuisine: "Grill", contact_email: "demo+abushanab@selecto.ps", phone_number: "+970590000027", rating: 4.8 },
  { name: "Rewined M&D", city: "Bethlehem", area: "Beit Sahour", cuisine: "International", contact_email: "demo+rewined@selecto.ps", phone_number: "+970590000028", rating: 4.7 },
  { name: "Olive Palace Restaurant", city: "Bethlehem", area: "Star Street", cuisine: "Middle Eastern", contact_email: "demo+olivepalace@selecto.ps", phone_number: "+970590000029", rating: 4.6 },
  { name: "Dar Nasser Bistro", city: "Bethlehem", area: "Old City", cuisine: "Bistro", contact_email: "demo+darnasser@selecto.ps", phone_number: "+970590000030", rating: 4.8 },
  { name: "Al Sufara Restaurant", city: "Bethlehem", area: "Manger Street", cuisine: "Middle Eastern", contact_email: "demo+alsufara@selecto.ps", phone_number: "+970590000031", rating: 4.5 },
  { name: "Star Street Kitchen", city: "Bethlehem", area: "Star Street", cuisine: "Traditional", contact_email: "demo+starstreet@selecto.ps", phone_number: "+970590000032", rating: 4.7 },

  // Jenin
  { name: "Jenin City Shawarma", city: "Jenin", area: "City Center", cuisine: "Shawarma", contact_email: "demo+jeninshawarma@selecto.ps", phone_number: "+970590000033", rating: 4.8 },
  { name: "Al Cinema Cafe", city: "Jenin", area: "Cinema Street", cuisine: "Cafe & Snacks", contact_email: "demo+alcinema@selecto.ps", phone_number: "+970590000034", rating: 4.6 },
  { name: "North Gate Grill", city: "Jenin", area: "Jenin Camp Area", cuisine: "Grill", contact_email: "demo+northgate@selecto.ps", phone_number: "+970590000035", rating: 4.7 },
  { name: "Jenin Old Market Bites", city: "Jenin", area: "Old Market", cuisine: "Street Food", contact_email: "demo+jeninbites@selecto.ps", phone_number: "+970590000036", rating: 4.8 },
  { name: "Al Rawda Cafe", city: "Jenin", area: "City Center", cuisine: "Cafe", contact_email: "demo+alrawda@selecto.ps", phone_number: "+970590000037", rating: 4.5 },

  // Tulkarm
  { name: "Thabet Street Grill", city: "Tulkarm", area: "Thabet Thabet Street", cuisine: "Grill", contact_email: "demo+thabetgrill@selecto.ps", phone_number: "+970590000038", rating: 4.7 },
  { name: "Tulkarm Old Souq Bites", city: "Tulkarm", area: "Old Souq", cuisine: "Street Food", contact_email: "demo+tulkarmsouq@selecto.ps", phone_number: "+970590000039", rating: 4.6 },
  { name: "Al Madina Cafe", city: "Tulkarm", area: "City Center", cuisine: "Cafe & Snacks", contact_email: "demo+almadinacafe@selecto.ps", phone_number: "+970590000040", rating: 4.5 },
  { name: "Tulkarm Shawarma House", city: "Tulkarm", area: "City Center", cuisine: "Shawarma", contact_email: "demo+tulkarmshawarma@selecto.ps", phone_number: "+970590000041", rating: 4.8 },
  { name: "Al Quds Bakery Tulkarm", city: "Tulkarm", area: "Thabet Thabet Street", cuisine: "Bakery", contact_email: "demo+alqudsbakery@selecto.ps", phone_number: "+970590000042", rating: 4.9 },

  // Qalqilya
  { name: "Al Souq Shawarma", city: "Qalqilya", area: "Al-Souq Area", cuisine: "Shawarma", contact_email: "demo+souqshawarma@selecto.ps", phone_number: "+970590000043", rating: 4.6 },
  { name: "Qalqilya Grill House", city: "Qalqilya", area: "Main Street", cuisine: "Grill", contact_email: "demo+qalqilyagrill@selecto.ps", phone_number: "+970590000044", rating: 4.7 },
  { name: "Green City Cafe", city: "Qalqilya", area: "City Center", cuisine: "Cafe", contact_email: "demo+greencity@selecto.ps", phone_number: "+970590000045", rating: 4.5 },
  { name: "Al Madina Falafel", city: "Qalqilya", area: "Al-Souq Area", cuisine: "Falafel", contact_email: "demo+almadinafalafel@selecto.ps", phone_number: "+970590000046", rating: 4.8 },
  { name: "Qalqilya Bakery", city: "Qalqilya", area: "Main Street", cuisine: "Bakery", contact_email: "demo+qalqilyabakery@selecto.ps", phone_number: "+970590000047", rating: 4.7 },

  // Jericho
  { name: "Oasis Grill", city: "Jericho", area: "Oasis Area", cuisine: "Grill & Arabic", contact_email: "demo+oasisgrill@selecto.ps", phone_number: "+970590000048", rating: 4.8 },
  { name: "Hisham Palace Cafe", city: "Jericho", area: "Hisham Palace Area", cuisine: "Cafe & Drinks", contact_email: "demo+hishamcafe@selecto.ps", phone_number: "+970590000049", rating: 4.9 },
  { name: "Jericho Date Cafe", city: "Jericho", area: "City Center", cuisine: "Cafe & Desserts", contact_email: "demo+jerichodate@selecto.ps", phone_number: "+970590000050", rating: 4.7 },
  { name: "City Center Shawarma", city: "Jericho", area: "City Center", cuisine: "Shawarma", contact_email: "demo+jerichoshawarma@selecto.ps", phone_number: "+970590000051", rating: 4.6 },
  { name: "Palm Garden Bites", city: "Jericho", area: "Oasis Area", cuisine: "Snacks", contact_email: "demo+palmgarden@selecto.ps", phone_number: "+970590000052", rating: 4.5 },

  // Jerusalem
  { name: "Salah Al Din Shawarma", city: "Jerusalem", area: "Salah Al-Din Street", cuisine: "Shawarma", contact_email: "demo+salahaldin@selecto.ps", phone_number: "+970590000053", rating: 4.9 },
  { name: "Beit Hanina Bites", city: "Jerusalem", area: "Beit Hanina", cuisine: "International & Fast Food", contact_email: "demo+beithanina@selecto.ps", phone_number: "+970590000054", rating: 4.7 },
  { name: "Shuafat Grill", city: "Jerusalem", area: "Shuafat", cuisine: "Grill", contact_email: "demo+shuafatgrill@selecto.ps", phone_number: "+970590000055", rating: 4.8 },
  { name: "Old City Falafel House", city: "Jerusalem", area: "Old City", cuisine: "Falafel & Hummus", contact_email: "demo+oldcityfalafel@selecto.ps", phone_number: "+970590000056", rating: 4.9 },
  { name: "Jerusalem Manakeesh", city: "Jerusalem", area: "Old City", cuisine: "Bakery", contact_email: "demo+jerusalemmanakeesh@selecto.ps", phone_number: "+970590000057", rating: 4.8 },
];

const imageByCategory: Record<string, string> = {
  وجبات: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
  برغر: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  بيتزا: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  حلويات: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80",
  مخبوزات: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
  شاورما: "https://images.unsplash.com/photo-1648823153746-9d363d508e6c?auto=format&fit=crop&w=1200&q=80",
  فلافل: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&w=1200&q=80",
  سوشي: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
  عصائر: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",
};

const offerTemplates = [
  { name: "وجبة شاورما دجاج", description: "وجبة شاورما دجاج مع بطاطا ومشروب.", category: "شاورما", original_price: 35, discounted_price: 24 },
  { name: "ساندويش فلافل طازج", description: "ساندويش فلافل طازج مع مخللات وصلصة.", category: "فلافل", original_price: 15, discounted_price: 10 },
  { name: "رول مسخن فلسطيني", description: "رول مسخن فلسطيني بكمية محدودة.", category: "وجبات", original_price: 25, discounted_price: 18 },
  { name: "بوكس كنافة", description: "بوكس كنافة مناسب للمشاركة.", category: "حلويات", original_price: 50, discounted_price: 35 },
  { name: "كومبو برجر", description: "كومبو برجر مع بطاطا.", category: "برغر", original_price: 45, discounted_price: 30 },
  { name: "منقوشة زعتر", description: "منقوشة زعتر بزيت زيتون بلدي.", category: "مخبوزات", original_price: 12, discounted_price: 8 },
  { name: "منقوشة جبنة", description: "منقوشة جبنة بيضاء طازجة.", category: "مخبوزات", original_price: 15, discounted_price: 10 },
  { name: "بوكس فلافل وحمص", description: "فلافل، حمص، مخللات وخبز ساخن.", category: "فلافل", original_price: 30, discounted_price: 20 },
  { name: "وجبة مشاوي فردية", description: "طبق مشاوي مع أرز وسلطة وخبز طابون.", category: "وجبات", original_price: 60, discounted_price: 45 },
  { name: "بيتزا مارجريتا", description: "بيتزا جبنة وصلصة طماطم بعجينة طازجة.", category: "بيتزا", original_price: 40, discounted_price: 28 },
  { name: "كوب عصير مانجو", description: "عصير مانجو طبيعي طازج.", category: "عصائر", original_price: 15, discounted_price: 10 },
  { name: "وجبة كريسبي", description: "دجاج مقرمش مع بطاطا وسلطة كولسلو.", category: "وجبات", original_price: 38, discounted_price: 28 },
];

const pickupTimes = [
  "1:00 PM - 3:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "5:00 PM - 7:00 PM",
  "6:00 PM - 8:00 PM",
  "7:00 PM - 9:00 PM",
];

async function findUser(email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((candidate) => candidate.email === email);
  if (!user) throw new Error(`Missing auth user: ${email}. Create demo users first.`);
  return user;
}

async function main() {
  console.log("Starting Palestine demo data seed...");

  const zaman = await findUser("zaman@example.com");
  const burgers = await findUser("burgers@example.com");
  const demoOwners = [zaman.id, burgers.id];

  const { data: existingRestaurants, error: fetchRestError } = await admin
    .from("restaurants")
    .select("id, name, city");

  if (fetchRestError) throw fetchRestError;

  let insertedRestaurantsCount = 0;
  let reusedRestaurantsCount = 0;
  let insertedOffersCount = 0;
  let skippedOffersCount = 0;

  for (let i = 0; i < restaurantsData.length; i++) {
    const restData = restaurantsData[i];
    
    // Check if restaurant exists (case-insensitive name and city)
    const existing = existingRestaurants.find(r => 
      r.name.toLowerCase() === restData.name.toLowerCase() && 
      r.city.toLowerCase() === restData.city.toLowerCase()
    );

    let restaurantId;
    
    if (existing) {
      restaurantId = existing.id;
      reusedRestaurantsCount++;
    } else {
      const ownerId = demoOwners[i % demoOwners.length];
      const { data, error } = await admin
        .from("restaurants")
        .insert({
          owner_id: ownerId,
          name: restData.name,
          city: restData.city,
          address: restData.area, // Mapping area to address since area column might not exist
          cuisine: restData.cuisine,
          contact_email: restData.contact_email,
          phone_number: restData.phone_number,
          rating: restData.rating,
          active: true
        })
        .select("id")
        .single();
        
      if (error) throw error;
      restaurantId = data.id;
      insertedRestaurantsCount++;
    }

    // Now seed offers for this restaurant
    const { data: existingOffers, error: fetchOffersError } = await admin
      .from("offers")
      .select("id, name")
      .eq("restaurant_id", restaurantId);
      
    if (fetchOffersError) throw fetchOffersError;

    // Pick 3-5 random offers deterministically based on index
    const numOffers = 3 + (i % 3);
    for (let j = 0; j < numOffers; j++) {
      const template = offerTemplates[(i + j) % offerTemplates.length];
      
      const offerExists = existingOffers.find(o => o.name.toLowerCase() === template.name.toLowerCase());
      
      if (offerExists) {
        skippedOffersCount++;
        continue;
      }

      const { error: insertOfferError } = await admin
        .from("offers")
        .insert({
          restaurant_id: restaurantId,
          name: template.name,
          description: template.description,
          image: imageByCategory[template.category] || imageByCategory["وجبات"],
          category: template.category,
          cuisine: restData.cuisine,
          original_price: template.original_price,
          discounted_price: template.discounted_price,
          valid_until: "اليوم، 10:00 مساءً",
          prep_minutes: `${15 + (j % 3) * 5} دقيقة`,
          pickup_time: pickupTimes[(i + j) % pickupTimes.length],
          active: true
        });

      if (insertOfferError) throw insertOfferError;
      insertedOffersCount++;
    }
  }

  console.log(`\nSeed completed!`);
  console.log(`- Inserted Restaurants: ${insertedRestaurantsCount}`);
  console.log(`- Reused Restaurants: ${reusedRestaurantsCount}`);
  console.log(`- Inserted Offers: ${insertedOffersCount}`);
  console.log(`- Skipped Duplicate Offers: ${skippedOffersCount}`);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
