import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, MapPin, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { toast } from "sonner";
import { BottomNav } from "@/shared/layout/BottomNav";
import { useAuth, useCustomerGuard } from "@/features/auth/auth.context";
import { useCart, type CartItem } from "@/features/cart/cart.context";
import { placeOrder } from "@/features/cart/checkout.functions";
import { formatILS, MAX_CART_QUANTITY } from "@/features/offers/offers.service";

export const Route = createFileRoute("/cart")({ head: () => ({ meta: [{ title: "السلة | Selecto" }] }), component: CartPage });

function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  useCustomerGuard();
  
  async function submitOrder() {
    if (!user) { toast.info("سجل دخولك لإتمام الحجز."); router.navigate({ to: "/auth", search: { redirect: "/cart" } }); return; }
    
    if (fulfillmentType === "delivery" && !deliveryAddress.trim()) {
      toast.error("يرجى إدخال عنوان التوصيل.");
      return;
    }

    setCheckingOut(true);
    try {
      await placeOrder({ 
        data: { 
          items: items.map((item) => ({ offerId: item.offer.id, quantity: item.quantity })), 
          fulfillmentType, 
          deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : undefined,
          customerNote: customerNote.trim() ? customerNote.trim() : undefined,
          fulfillmentTime: items.map((i) => i.offer.pickupTime).join(" | "), 
          paymentMethod: "cash_on_pickup" 
        } 
      });
      toast.success("تم حجز طلبك بنجاح. يمكنك استلامه في الوقت المحدد.");
      try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) { /* ignore */ }
      clearCart();
      router.navigate({ to: "/orders" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إرسال الطلب.");
    } finally {
      setCheckingOut(false);
    }
  }

  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="phone-frame min-h-screen bg-background pb-[200px] text-foreground">
      <Header count={totalItems} />
      <main className="space-y-4 px-5 py-5">
        {items.map((item) => <CartRow key={item.offer.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />)}
        
        {/* Fulfillment Selection */}
        <section className="space-y-3" dir="rtl">
          <p className="text-sm font-black text-foreground">طريقة الاستلام</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFulfillmentType("pickup")}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-black transition-colors ${fulfillmentType === "pickup" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground"}`}
            >
              <ShoppingBag className="size-6" />
              استلام من المطعم
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentType("delivery")}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-black transition-colors ${fulfillmentType === "delivery" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground"}`}
            >
              <Truck className="size-6" />
              توصيل
            </button>
          </div>
          
          {fulfillmentType === "pickup" && <PickupBox items={items} />}
          
          {fulfillmentType === "delivery" && (
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-sm font-black text-primary"><MapPin className="size-4" /> عنوان التوصيل بالتفصيل</span>
                <textarea 
                  rows={2}
                  placeholder="مثال: رام الله، الماصيون، قرب دوار محمود درويش، عمارة الأمل ط3..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full resize-none rounded-xl border border-primary/20 bg-background px-4 py-3 text-sm font-bold outline-none focus:border-primary"
                />
              </label>
              <p className="mt-2 text-xs font-bold text-muted-foreground">ملاحظة: سيتم إضافة رسوم التوصيل عند استلام الطلب من المندوب.</p>
            </div>
          )}
        </section>

        <section className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-sm" dir="rtl">
          <label className="block text-sm font-black text-foreground">
            ملاحظات على الطلب
          </label>
          <textarea 
            rows={2}
            placeholder="مثال: بدون بصل، الرجاء تجهيز الطلب عند الساعة 6:00"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold outline-none focus:border-primary"
          />
        </section>

        <PaymentMethodBox />
        <TotalBox subtotal={subtotal} />
      </main>

      <div className="safe-bottom fixed inset-x-0 bottom-[64px] z-40 mx-auto max-w-[1200px] border-t border-border bg-background/95 px-5 pb-3 pt-3 backdrop-blur">
        <button type="button" onClick={submitOrder} disabled={checkingOut} className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-sm font-black text-primary-foreground shadow-card disabled:opacity-60">
          <span className="flex items-center gap-2">{checkingOut ? "جاري تأكيد الطلب..." : "تأكيد الحجز"}<Check className="size-4" /></span>
          <span>{formatILS(subtotal)}</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
function EmptyCart() { return <div className="phone-frame min-h-screen bg-background pb-20 text-foreground"><Header count={0} /><main className="grid flex-1 place-items-center px-6 py-20 text-center"><div className="max-w-xs"><div className="mx-auto grid size-20 place-items-center rounded-full bg-secondary text-primary"><ShoppingBag className="size-9" /></div><h1 className="mt-5 font-display text-2xl font-black">السلة فارغة</h1><p className="mt-2 text-sm font-semibold leading-7 text-muted-foreground">اختر وجبة من عروض اليوم وأضفها للسلة.</p><Link to="/offers" className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-card">تصفح العروض</Link></div></main><BottomNav /></div>; }
function Header({ count }: { count: number }) { return <header className="border-b border-border bg-card px-5 py-5"><div className="flex items-center justify-between"><span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-primary">{count} وجبات</span><h1 className="font-display text-2xl font-black">السلة</h1></div></header>; }
function CartRow({ item, updateQuantity, removeItem }: { item: CartItem; updateQuantity: (offerId: string, quantity: number) => void; removeItem: (offerId: string) => void }) {
  const maxQuantity = Math.min(item.offer.availableQuantity ?? MAX_CART_QUANTITY, MAX_CART_QUANTITY);
  return <article className="relative flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm" dir="rtl"><img src={item.offer.image} alt={item.offer.name} className="size-20 shrink-0 rounded-xl object-cover" /><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-black">{item.offer.name}</h2><p className="mt-0.5 truncate text-xs font-bold text-muted-foreground">{item.offer.restaurant}</p><p className="mt-1 flex items-center gap-1 text-[11px] font-black text-primary"><Clock className="size-3" />{item.offer.pickupTime || "وقت الاستلام يحدده المطعم"}</p><div className="mt-3 flex items-center justify-between"><span className="font-display text-base font-black text-primary">{formatILS(item.offer.discountedPrice)}</span><div className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1"><button type="button" onClick={() => updateQuantity(item.offer.id, item.quantity - 1)} className="grid size-7 place-items-center rounded-full bg-card text-primary"><Minus className="size-3.5" /></button><span className="w-5 text-center text-xs font-black">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.offer.id, item.quantity + 1)} disabled={item.quantity >= maxQuantity} className="grid size-7 place-items-center rounded-full bg-card text-primary disabled:opacity-40"><Plus className="size-3.5" /></button></div></div></div><button type="button" onClick={() => removeItem(item.offer.id)} className="absolute left-2 top-2 grid size-8 place-items-center rounded-full bg-background text-destructive"><Trash2 className="size-4" /></button></article>;
}
function PickupBox({ items }: { items: CartItem[] }) { return <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2" dir="rtl"><p className="text-sm font-black text-primary">الاستلام من المطعم</p><div className="mt-3 space-y-2">{items.map((item) => <div key={item.offer.id} className="flex justify-between gap-3 text-xs font-bold"><span className="min-w-0 truncate text-foreground">{item.offer.name}</span><span className="shrink-0 text-primary">{item.offer.pickupTime || "يحدده المطعم"}</span></div>)}</div></div>; }
function PaymentMethodBox() { 
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm" dir="rtl">
      <p className="text-sm font-black text-foreground">طريقة الدفع</p>
      <div className="space-y-3">
        {/* Cash Option */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary bg-primary/5 p-3 transition-colors">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[5px] border-primary bg-background" />
          <div>
            <p className="text-sm font-black text-primary">الدفع عند الاستلام</p>
            <p className="mt-1 text-[11px] font-bold text-muted-foreground">ادفع نقداً عند استلام طلبك من المطعم.</p>
          </div>
        </label>
        
        {/* Visa Option */}
        <div 
          onClick={() => toast.info("الدفع بالبطاقة سيتم تفعيله قريباً.")}
          className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-border bg-secondary/50 p-3 opacity-60 transition-colors"
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground bg-background" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-muted-foreground">الدفع بالبطاقة / Visa</p>
              <span className="rounded-full bg-border px-2 py-0.5 text-[9px] font-black text-muted-foreground">قريباً</span>
            </div>
            <p className="mt-1 text-[11px] font-bold text-muted-foreground">سيتم التفعيل قريباً</p>
          </div>
        </div>
      </div>
    </section>
  ); 
}
function TotalBox({ subtotal }: { subtotal: number }) { return <section className="rounded-2xl border border-border bg-card p-4 shadow-sm" dir="rtl"><div className="flex items-center justify-between text-base font-black"><span>الإجمالي (غير شامل التوصيل)</span><span className="text-primary">{formatILS(subtotal)}</span></div></section>; }
