import { supabase } from "@/integrations/supabase/client";

type CheckoutInput = {
  items: Array<{
    offerId: string;
    quantity: number;
  }>;
  fulfillmentType: "pickup" | "delivery";
  fulfillmentTime: string;
  paymentMethod: "cash";
};

/**
 * placeOrder — client-side checkout function.
 *
 * Previously this used createServerFn + requireSupabaseAuth middleware which caused
 * infinite loading because the SSR middleware chain could silently fail in dev mode
 * (missing Authorization header in getRequest(), getClaims() hanging, etc.).
 *
 * Now it uses the client-side supabase instance directly. RLS policy
 * `(auth.uid() = customer_id)` protects INSERT. The `set_commission` database trigger
 * handles all price/commission calculations automatically.
 */
export async function placeOrder({ data }: { data: CheckoutInput }) {
  // 1. Validate user is logged in
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("[Checkout] No authenticated user:", userError);
    throw new Error("يجب تسجيل الدخول أولاً لإتمام الطلب. / You must be signed in to place an order.");
  }
  console.log("[Checkout] User authenticated:", user.id);

  // 2. Validate input
  if (!data.items || data.items.length === 0) {
    throw new Error("السلة فارغة. أضف وجبة واحدة على الأقل. / Cart is empty.");
  }

  // 3. Fetch offer details from database to get secure prices and restaurant_id
  const offerIds = data.items.map((it) => it.offerId);
  console.log("[Checkout] Fetching offers:", offerIds);

  const { data: offersData, error: offersError } = await supabase
    .from("offers")
    .select("id, restaurant_id, discounted_price, active, name")
    .in("id", offerIds);

  if (offersError) {
    console.error("[Checkout] Error fetching offers:", offersError);
    throw new Error(`خطأ في جلب تفاصيل العروض: ${offersError.message}`);
  }

  if (!offersData || offersData.length === 0) {
    console.error("[Checkout] No offers found for IDs:", offerIds);
    throw new Error("العروض المختارة غير متوفرة حالياً. يرجى تحديث الصفحة والمحاولة مجدداً.");
  }

  const offerMap = new Map<string, any>(offersData.map((o: any) => [o.id, o]));

  // 4. Build transaction inserts
  const inserts = data.items.map((item) => {
    const offer = offerMap.get(item.offerId);
    if (!offer) {
      console.error("[Checkout] Offer not found in database:", item.offerId);
      throw new Error(`العرض المحدد غير موجود: ${item.offerId}`);
    }
    if (!offer.restaurant_id) {
      console.error("[Checkout] Offer has no restaurant_id:", offer);
      throw new Error(`العرض "${offer.name}" غير مرتبط بأي مطعم.`);
    }

    const restaurantPrice = Number(offer.discounted_price) * item.quantity;
    console.log(`[Checkout] Item: ${offer.name}, qty: ${item.quantity}, restaurant_price: ${restaurantPrice}`);

    return {
      customer_id: user.id,
      offer_id: item.offerId,
      restaurant_id: offer.restaurant_id,
      restaurant_price: restaurantPrice,
      sale_amount: restaurantPrice,
      // The set_commission trigger will automatically calculate:
      // commission_rate = 0.20
      // commission_amount = restaurant_price * 0.20
      // customer_total_price = restaurant_price + commission_amount
      // restaurant_payout = restaurant_price
      // status = 'Pending'
    };
  });

  console.log("[Checkout] Inserting transactions:", inserts.length);

  // 5. Insert transactions
  const { data: transactions, error: insertError } = await supabase
    .from("transactions")
    .insert(inserts)
    .select();

  if (insertError) {
    console.error("[Checkout] Transaction insert error:", insertError);
    
    // Provide specific error messages for common issues
    if (insertError.message.includes("violates row-level security")) {
      throw new Error("خطأ في الصلاحيات: لا يمكن إنشاء المعاملة. يرجى تسجيل الخروج وإعادة الدخول. / RLS policy violation.");
    }
    if (insertError.message.includes("foreign key")) {
      throw new Error("خطأ في البيانات: العرض أو المطعم غير موجود. يرجى تحديث الصفحة. / Foreign key error.");
    }
    
    throw new Error(`فشل في إنشاء الطلب: ${insertError.message}`);
  }

  console.log("[Checkout] ✅ Transactions created successfully:", transactions?.length);

  return {
    orderCount: transactions?.length ?? 0,
    fulfillmentType: data.fulfillmentType,
    fulfillmentTime: data.fulfillmentTime,
    paymentMethod: data.paymentMethod,
  };
}
