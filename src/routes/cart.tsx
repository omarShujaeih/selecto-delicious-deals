import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth, useCustomerGuard } from "@/lib/auth-context";
import { useCart, type CartItem } from "@/lib/cart-context";
import { placeOrder } from "@/lib/checkout.functions";
import { formatILS, MAX_CART_QUANTITY } from "@/lib/offers-data";

export const Route = createFileRoute("/cart")({ head: () => ({ meta: [{ title: "السلة | Selecto" }] }), component: CartPage });

function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  useCustomerGuard();
  async function submitOrder() {
    if (!user) { toast.info("سجل دخولك لإتمام الحجز."); router.navigate({ to: "/auth", search: { redirect: "/cart" } }); return; }
    setCheckingOut(true);
    try {
      await placeOrder({ data: { items: items.map((item) => ({ offerId: item.offer.id, quantity: item.quantity })), fulfillmentType: "pickup", fulfillmentTime: items.map((i) => i.offer.pickupTime).join(" | "), paymentMethod: "cash" } });
      toast.success("تم تأكيد طلبك.");
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
    <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
      <Header count={totalItems} />
      <main className="space-y-4 px-5 py-5">
        {items.map((item) => <CartRow key={item.offer.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />)}
        <PickupBox items={items} />
        <TotalBox subtotal={subtotal} />
        <button type="button" onClick={submitOrder} disabled={checkingOut} className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-sm font-black text-primary-foreground shadow-card disabled:opacity-60">
          <span className="flex items-center gap-2">{checkingOut ? "جاري تأكيد الطلب..." : "تأكيد الحجز"}<Check className="size-4" /></span>
          <span>{formatILS(subtotal)}</span>
        </button>
      </main>
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
function PickupBox({ items }: { items: CartItem[] }) { return <section className="rounded-2xl border border-primary/15 bg-primary/5 p-4" dir="rtl"><p className="text-sm font-black text-primary">الاستلام من المطعم</p><div className="mt-3 space-y-2">{items.map((item) => <div key={item.offer.id} className="flex justify-between gap-3 text-xs font-bold"><span className="min-w-0 truncate text-foreground">{item.offer.name}</span><span className="shrink-0 text-primary">{item.offer.pickupTime || "يحدده المطعم"}</span></div>)}</div></section>; }
function TotalBox({ subtotal }: { subtotal: number }) { return <section className="rounded-2xl border border-border bg-card p-4 shadow-sm" dir="rtl"><div className="flex items-center justify-between text-base font-black"><span>الإجمالي المطلوب دفعه</span><span className="text-primary">{formatILS(subtotal)}</span></div></section>; }
