import { supabase, supabasePublic } from "@/integrations/supabase/client";

export type Offer = {
  id: string;
  name: string;
  restaurant: string;
  cuisine: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  restaurantPrice?: number;
  availableQuantity?: number;
  rating: number;
  distanceKm: number;
  prepMinutes: string;
  pickupTime?: string;
  image: string;
  validUntil: string;
  description: string;
  city?: string;
  area?: string;
  address?: string;
  mapUrl?: string;
  restaurant_id?: string;
};

export const SELECTO_COMMISSION_RATE = 0.2;
export const MAX_CART_QUANTITY = 10;

export function toCustomerPrice(restaurantPrice: number) {
  return roundMoney(restaurantPrice * (1 + SELECTO_COMMISSION_RATE));
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatILS(value: number) {
  return `₪${roundMoney(value).toFixed(2)}`;
}

export const categories = [
  "All",
  "وجبات",
  "برغر",
  "بيتزا",
  "شاورما",
  "فلافل",
  "حلويات",
  "مخبوزات",
  "عصائر",
] as const;

export const discountPct = (o: Offer) =>
  Math.round(((o.originalPrice - o.discountedPrice) / o.originalPrice) * 100);

type DbOffer = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category: string | null;
  cuisine: string | null;
  original_price: number;
  discounted_price: number;
  valid_until: string | null;
  prep_minutes: string | null;
  pickup_time: string | null;
  distance_km: number | null;
  rating: number | null;
  active: boolean;
  available_quantity?: number | null;
  restaurant_id: string;
  restaurants?: { name: string; cuisine: string; city: string; address: string | null; map_url: string | null } | null;
};

export function mapOffer(o: DbOffer): Offer & { restaurant_id: string; active: boolean; restaurantPrice: number; city: string; area: string; address: string } {
  const restaurantPrice = Number(o.discounted_price);
  const finalPrice = toCustomerPrice(restaurantPrice);

  const fullAddress = o.restaurants?.address ?? "";
  const addressParts = fullAddress.split(",");
  const area = addressParts[0] ? addressParts[0].trim() : "Downtown";

  return {
    id: o.id,
    name: o.name,
    restaurant: o.restaurants?.name ?? "Restaurant",
    cuisine: o.cuisine ?? o.restaurants?.cuisine ?? "",
    category: o.category ?? "Bowls",
    originalPrice: Number(o.original_price),
    discountedPrice: finalPrice,
    restaurantPrice: restaurantPrice,
    availableQuantity: Math.min(Number(o.available_quantity ?? MAX_CART_QUANTITY), MAX_CART_QUANTITY),
    rating: Number(o.rating ?? 4.5),
    distanceKm: Number(o.distance_km ?? 1.5),
    prepMinutes: o.prep_minutes ?? "20-25 min",
    pickupTime: o.pickup_time ?? "",
    image: o.image ?? "",
    validUntil: o.valid_until ?? "Today",
    description: o.description ?? "",
    restaurant_id: o.restaurant_id,
    active: o.active,
    city: o.restaurants?.city ?? "Ramallah",
    area: area,
    address: fullAddress,
    mapUrl: o.restaurants?.map_url ?? "",
  };
}

export async function fetchPublicOffers() {
  const { data, error } = await supabasePublic
    .from("offers")
    .select("*, restaurants(name, cuisine, city, address, map_url)")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbOffer[]).map(mapOffer);
}

export async function fetchOfferById(id: string) {
  const { data, error } = await supabasePublic
    .from("offers")
    .select("*, restaurants(name, cuisine, city, address, map_url)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOffer(data as DbOffer) : null;
}

export async function fetchMyRestaurant(userId: string) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", userId)
    .limit(1);
  
  if (error) {
    console.error("fetchMyRestaurant error:", error);
    return null;
  }
  
  return data && data.length > 0 ? data[0] : null;
}

export async function fetchMyOffers(restaurantId: string) {
  const { data, error } = await supabase
    .from("offers")
    .select("*, restaurants(name, cuisine, city, address, map_url)")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbOffer[]).map(mapOffer);
}

export async function fetchRestaurantById(id: string) {
  const { data, error } = await supabasePublic
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchRestaurantActiveOffers(restaurantId: string) {
  const { data, error } = await supabasePublic
    .from("offers")
    .select("*, restaurants(name, cuisine, city, address, map_url)")
    .eq("restaurant_id", restaurantId)
    .eq("active", true)
    .gt("available_quantity", 0)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbOffer[]).map(mapOffer);
}
