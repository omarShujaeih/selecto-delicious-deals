import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/lib/sample-data";
import {
  categories,
  discountPct,
  offerById as fallbackOfferById,
  offers as fallbackOffers,
} from "@/lib/sample-data";

export type { Offer };
export { categories, discountPct, fallbackOfferById, fallbackOffers };

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
  restaurant_id: string;
  restaurants?: { name: string; cuisine: string } | null;
};

export function mapOffer(o: DbOffer): Offer & { restaurant_id: string; active: boolean } {
  return {
    id: o.id,
    name: o.name,
    restaurant: o.restaurants?.name ?? "Restaurant",
    cuisine: o.cuisine ?? o.restaurants?.cuisine ?? "",
    category: (o.category as Offer["category"]) ?? "Bowls",
    originalPrice: Number(o.original_price),
    discountedPrice: Number(o.discounted_price),
    rating: Number(o.rating ?? 4.5),
    distanceKm: Number(o.distance_km ?? 1.5),
    prepMinutes: o.prep_minutes ?? "20-25 min",
    pickupTime: o.pickup_time ?? "",
    image: o.image ?? "",
    validUntil: o.valid_until ?? "Today",
    description: o.description ?? "",
    restaurant_id: o.restaurant_id,
    active: o.active,
  };
}

export async function fetchPublicOffers() {
  const { data, error } = await supabase
    .from("offers")
    .select("*, restaurants(name, cuisine)")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbOffer[]).map(mapOffer);
}

export async function fetchOfferById(id: string) {
  const { data, error } = await supabase
    .from("offers")
    .select("*, restaurants(name, cuisine)")
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
    .select("*, restaurants(name, cuisine)")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbOffer[]).map(mapOffer);
}
