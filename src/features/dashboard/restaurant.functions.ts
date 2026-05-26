import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { notifyCustomersOfOffer } from "@/features/push/push.functions";

// Helper function to verify restaurant role and get restaurant ID
async function requireRestaurant(supabase: any, userId: string) {
  const { data: roleData, error: roleError } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "restaurant",
  });
  
  if (roleError || !roleData) {
    throw new Error("Unauthorized: Must be a restaurant");
  }

  const { data: restaurants, error: restError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", userId)
    .limit(1);

  if (restError || !restaurants || restaurants.length === 0) {
    throw new Error("Restaurant profile not found");
  }

  return restaurants[0].id;
}

export const getMyRestaurantStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const restaurantId = await requireRestaurant(sb, context.userId);

    const { data: transactions, error: txError } = await sb
      .from("transactions")
      .select("restaurant_payout, customer_total_price, commission_amount, created_at, status")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (txError) throw new Error(txError.message);

    const { count: offersCount, error: offersError } = await sb
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId);
      
    const { count: activeOffersCount, error: activeOffersError } = await sb
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("active", true);

    const totalOrders = transactions?.length || 0;
    const totalPayouts = transactions?.reduce((sum: number, tx: any) => sum + (Number(tx.restaurant_payout) || 0), 0) || 0;
    const totalCommissions = transactions?.reduce((sum: number, tx: any) => sum + (Number(tx.commission_amount) || 0), 0) || 0;
    const totalCustomerPayments = transactions?.reduce((sum: number, tx: any) => sum + (Number(tx.customer_total_price) || 0), 0) || 0;
    const salesByDay = new Map<string, number>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      salesByDay.set(day.toISOString().slice(0, 10), 0);
    }

    for (const tx of transactions ?? []) {
      const key = new Date(tx.created_at).toISOString().slice(0, 10);
      if (salesByDay.has(key)) {
        salesByDay.set(key, (salesByDay.get(key) ?? 0) + (Number(tx.customer_total_price) || 0));
      }
    }

    return {
      totalOrders,
      totalPayouts,
      totalCommissions,
      totalCustomerPayments,
      totalOffers: offersCount || 0,
      activeOffers: activeOffersCount || 0,
      salesTrend: Array.from(salesByDay.entries()).map(([day, sales]) => ({ day, sales })),
      recentTransactions: transactions?.slice(0, 5) || [],
    };
  });

export const getMyTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const restaurantId = await requireRestaurant(sb, context.userId);

    const { data: transactions, error } = await sb
      .from("transactions")
      .select(`
        *,
        offers (name, image, discounted_price)
      `)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return transactions || [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    id: z.string().uuid(),
    status: z.string().min(1),
    cancellation_reason: z.string().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const restaurantId = await requireRestaurant(sb, context.userId);

    // Verify ownership
    const { data: existing, error: fetchError } = await sb
      .from("transactions")
      .select("restaurant_id")
      .eq("id", data.id)
      .limit(1);

    if (fetchError || !existing || existing.length === 0 || existing[0].restaurant_id !== restaurantId) {
      throw new Error("Unauthorized to edit this transaction");
    }

    const { error } = await sb
      .from("transactions")
      .update({ 
        status: data.status,
        ...(data.cancellation_reason ? { cancellation_reason: data.cancellation_reason } : {})
      })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updateRestaurantProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    name: z.string().min(1),
    cuisine: z.string().min(1),
    city: z.string().min(1),
    contact_email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    map_url: z.string().url().optional().or(z.literal("")),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const restaurantId = await requireRestaurant(sb, context.userId);

    const { error } = await sb
      .from("restaurants")
      .update({
        name: data.name,
        cuisine: data.cuisine,
        city: data.city,
        contact_email: data.contact_email || null,
        address: data.address || null,
        map_url: data.map_url || null,
      })
      .eq("id", restaurantId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getMyOffers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const restaurantId = await requireRestaurant(sb, context.userId);

    const { data: offers, error } = await sb
      .from("offers")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (offers || []).map((o: any) => ({
      id: o.id,
      name: o.name,
      image: o.image,
      active: o.active,
      pickupTime: o.pickup_time,
      originalPrice: Number(o.original_price),
      restaurantPrice: Number(o.discounted_price), // base payout
      discountedPrice: Number(o.discounted_price) * 1.20, // customer price
      availableQuantity: Number(o.available_quantity ?? 10),
    }));
  });

const OfferSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  cuisine: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  original_price: z.number().min(0),
  discounted_price: z.number().min(0), // restaurant_price
  pickup_time: z.string().min(1),
  active: z.boolean().default(true),
});

export const createOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => OfferSchema.parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const restaurantId = await requireRestaurant(sb, context.userId);

    const { data: offer, error } = await sb
      .from("offers")
      .insert({
        ...data,
        restaurant_id: restaurantId,
      })
      .select(`*, restaurants (name)`)
      .single();

    if (error) throw new Error(error.message);

    if (offer?.restaurants?.name) {
      notifyCustomersOfOffer({ data: { restaurantName: offer.restaurants.name, offerName: offer.name } }).catch(() => {});
    }

    return offer;
  });

export const updateOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => OfferSchema.parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const restaurantId = await requireRestaurant(sb, context.userId);

    if (!data.id) throw new Error("Offer ID required");

    // Verify ownership
    const { data: existing, error: fetchError } = await sb
      .from("offers")
      .select("restaurant_id")
      .eq("id", data.id)
      .single();

    if (fetchError || !existing || existing.restaurant_id !== restaurantId) {
      throw new Error("Unauthorized to edit this offer");
    }

    const { data: offer, error } = await sb
      .from("offers")
      .update(data)
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return offer;
  });

export const deactivateOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    const restaurantId = await requireRestaurant(sb, context.userId);

    // Verify ownership
    const { data: existing, error: fetchError } = await sb
      .from("offers")
      .select("restaurant_id")
      .eq("id", data.id)
      .single();

    if (fetchError || !existing || existing.restaurant_id !== restaurantId) {
      throw new Error("Unauthorized to edit this offer");
    }

    const { error } = await sb
      .from("offers")
      .update({ active: false })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
