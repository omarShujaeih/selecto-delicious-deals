import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CheckoutInput = z.object({
  items: z
    .array(
      z.object({
        offerId: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
  fulfillmentType: z.enum(["pickup", "delivery"]),
  fulfillmentTime: z.string().min(1).max(500),
  paymentMethod: z.literal("cash"),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CheckoutInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: transactions, error } = await (context.supabase as any).rpc("place_order", {
      _items: data.items,
    });

    if (error) throw new Error(error.message);

    return {
      orderCount: transactions?.length ?? 0,
      fulfillmentType: data.fulfillmentType,
      fulfillmentTime: data.fulfillmentTime,
      paymentMethod: data.paymentMethod,
    };
  });
