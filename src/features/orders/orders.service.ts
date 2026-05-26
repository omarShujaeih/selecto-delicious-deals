import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/shared/lib/async-timeout";

export type CustomerOrder = {
  id: string;
  sale_amount: number;
  commission_amount: number;
  customer_total_price: number | null;
  restaurant_price: number;
  status: string | null;
  created_at: string;
  offers?: { name: string; image: string | null; pickup_time?: string | null } | null;
  restaurants?: { name: string; city?: string | null } | null;
};

export async function fetchMyOrders(customerId: string): Promise<CustomerOrder[]> {
  const { data, error } = await withTimeout(
    supabase
      .from("transactions")
      .select(
        "id, sale_amount, commission_amount, customer_total_price, restaurant_price, status, created_at, offers(name, image, pickup_time), restaurants(name, city)",
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    8000,
    "Loading customer orders",
  );

  if (error) throw error;
  return (data as CustomerOrder[]) ?? [];
}
