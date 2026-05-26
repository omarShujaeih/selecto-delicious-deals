import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendPushNotification } from "./push.service";

export const notifyRestaurantOfOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        orderCount: z.number(),
      })
      .parse(input),
  )
  .handler(async ({ data: input }) => {
    // 1. Get restaurant user ID to find their token
    const { data: restaurant } = await supabaseAdmin
      .from("restaurants")
      .select("owner_id, name")
      .eq("id", input.restaurantId)
      .single();

    if (!restaurant?.owner_id) return { success: false };

    // 2. Get their FCM token
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", restaurant.owner_id)
      .single() as unknown as any;

    if (profile?.fcm_token) {
      await sendPushNotification({
        tokens: [profile.fcm_token],
        title: "طلب جديد! 🚨",
        body: `تلقيت طلب جديد لـ ${input.orderCount} وجبة في ${restaurant.name}`,
      });
    }

    return { success: true };
  });

export const notifyCustomersOfOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        restaurantName: z.string(),
        offerName: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data: input }) => {
    // In a real scenario we might filter by city. For now, broadcast to a limited set or everyone with a token.
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .not("fcm_token", "is", null)
      .limit(100) as unknown as any; // Limit for safety

    const tokens = profiles?.map((p: any) => p.fcm_token).filter(Boolean) as string[];

    if (tokens && tokens.length > 0) {
      await sendPushNotification({
        tokens,
        title: "عرض جديد متاح! 🍔",
        body: `عرض جديد "${input.offerName}" من ${input.restaurantName}`,
      });
    }

    return { success: true };
  });

export const notifyCustomerOfOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        transactionId: z.string(),
        status: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data: input }) => {
    // 1. Get transaction to find customer id and offer name
    const { data: tx } = await supabaseAdmin
      .from("transactions")
      .select("customer_id, offers(name), status")
      .eq("id", input.transactionId)
      .single();

    if (!tx?.customer_id) return { success: false };

    // 2. Get customer's FCM token
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", tx.customer_id)
      .single() as unknown as any;

    if (profile?.fcm_token) {
      let message = "تم تحديث حالة طلبك";
      if (input.status === "completed") message = "طلبك مقبول وجاري تحضيره! ✅";
      else if (input.status === "ready_for_pickup") message = "طلبك جاهز! 🎉";
      else if (input.status === "cancelled") message = "نأسف، تم إلغاء طلبك. ❌";
      
      const offerName = (tx.offers as any)?.name || "الوجبة";

      await sendPushNotification({
        tokens: [profile.fcm_token],
        title: "تحديث الطلب",
        body: `${message} (${offerName})`,
      });
    }

    return { success: true };
  });
