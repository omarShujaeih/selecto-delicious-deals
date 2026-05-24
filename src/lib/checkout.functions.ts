import { supabase } from "@/integrations/supabase/client";
import { MAX_CART_QUANTITY } from "@/lib/offers-data";

type CheckoutInput = {
  items: Array<{
    offerId: string;
    quantity: number;
  }>;
  fulfillmentType: "pickup" | "delivery";
  fulfillmentTime: string;
  paymentMethod: "cash";
};

export async function placeOrder({ data }: { data: CheckoutInput }) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("You must be signed in to place an order.");
  }

  if (!data.items.length) {
    throw new Error("Cart is empty.");
  }
  if (data.items.length > 20) {
    throw new Error("Order has too many items.");
  }

  const items = data.items.map((item) => {
    if (!item.offerId) {
      throw new Error("Invalid cart item.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_CART_QUANTITY) {
      throw new Error("Invalid item quantity.");
    }
    return { offerId: item.offerId, quantity: item.quantity };
  });

  const { data: transactions, error } = await supabase.rpc("place_order", {
    _items: items,
  });

  if (error) {
    if (error.message.includes("Could not find the function")) {
      throw new Error("Checkout RPC is not installed on Supabase. Apply the latest database migration before taking orders.");
    }
    if (error.message.includes("no longer available")) {
      throw new Error("One or more offers are no longer available. Refresh your cart and try again.");
    }
    if (error.message.includes("Invalid item quantity")) {
      throw new Error("Invalid item quantity.");
    }
    if (error.message.includes("too many items")) {
      throw new Error("Order has too many items.");
    }
    throw new Error(`Failed to place order: ${error.message}`);
  }

  return {
    orderCount: transactions?.length ?? 0,
    fulfillmentType: data.fulfillmentType,
    fulfillmentTime: data.fulfillmentTime,
    paymentMethod: data.paymentMethod,
  };
}
