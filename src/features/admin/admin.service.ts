import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/shared/lib/async-timeout";

export type AdminTransaction = {
  id: string;
  customer_total_price: number;
  commission_amount: number;
  restaurant_payout: number;
  created_at: string;
  profiles: { display_name: string } | null;
  restaurants: { name: string } | null;
  offers: { name: string } | null;
};

export type AdminOverviewData = {
  counts: {
    restaurants: number;
    offers: number;
    activeOffers: number;
    transactions: number;
  };
  transactions: AdminTransaction[];
};

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  const [restCount, offerCount, activeOfferCount, txCount, allTxRes] = await withTimeout(
    Promise.all([
      supabase.from("restaurants").select("*", { count: "exact", head: true }),
      supabase.from("offers").select("*", { count: "exact", head: true }),
      supabase.from("offers").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("transactions").select("*", { count: "exact", head: true }),
      supabase
        .from("transactions")
        .select(
          "id, customer_total_price, commission_amount, restaurant_payout, created_at, profiles(display_name), restaurants(name), offers(name)",
        )
        .order("created_at", { ascending: false }),
    ]),
    8000,
    "Loading admin overview",
  );

  const firstError = [
    restCount.error,
    offerCount.error,
    activeOfferCount.error,
    txCount.error,
    allTxRes.error,
  ].find(Boolean);
  if (firstError) throw firstError;

  return {
    counts: {
      restaurants: restCount.count ?? 0,
      offers: offerCount.count ?? 0,
      activeOffers: activeOfferCount.count ?? 0,
      transactions: txCount.count ?? 0,
    },
    transactions: (allTxRes.data as unknown as AdminTransaction[]) ?? [],
  };
}
