import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  Clock,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth, useCustomerGuard } from "@/lib/auth-context";
import { useCart, type CartItem } from "@/lib/cart-context";
import { placeOrder } from "@/lib/checkout.functions";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Cart — Selecto" }],
  }),
  component: CartPage,
});

type CheckoutStep = "options" | "confirm";

function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("options");
  useCustomerGuard();

  const pickupSummary = getPickupSummary(items);

  function openCheckout() {
    if (!user) {
      toast.info("الرجاء تسجيل الدخول أولاً لإتمام الحجز.");
      router.navigate({ to: "/auth", search: { redirect: "/cart" } });
      return;
    }
    if (items.length === 0) return;
    setShowCheckout(true);
    setStep("options");
  }

  async function handlePlaceOrder() {
    setCheckingOut(true);
    try {
      await placeOrder({
        data: {
          items: items.map((item) => ({
            offerId: item.offer.id,
            quantity: item.quantity,
          })),
          fulfillmentType: "pickup",
          fulfillmentTime: pickupSummary,
          paymentMethod: "cash",
        },
      });

      toast.success("تم تأكيد طلبك بنجاح! يرجى استلام الوجبة من المطعم في الوقت المحدد.");
      clearCart();
      setShowCheckout(false);
      router.navigate({ to: "/orders" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل في إرسال طلبك.";
      toast.error(message);
    } finally {
      setCheckingOut(false);
    }
  }

  function closeCheckout() {
    setShowCheckout(false);
    setStep("options");
  }

  if (items.length === 0) {
    return (
      <div className="phone-frame flex min-h-screen flex-col bg-background pb-20 text-foreground">
        <header className="px-5 pt-6 pb-4 border-b border-border/40">
          <h1 className="font-display text-2xl font-black text-right" dir="rtl">سلة المشتريات</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-secondary text-primary">
            <ShoppingBag className="size-10" />
          </div>
          <h2 className="text-xl font-black">سلتك فارغة حالياً</h2>
          <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
            تصفح وجباتك المفضلة بخصومات تصل إلى 50% وأضفها إلى السلة لتستمتع بها بسعر مخفّض.
          </p>
          <Link
            to="/offers"
            className="mt-4 rounded-2xl bg-primary px-6 py-3.5 text-xs font-black text-primary-foreground shadow-card transition-transform active:scale-95 hover:scale-102"
          >
            تصفح العروض المخفضة
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="phone-frame flex min-h-screen flex-col bg-background pb-20 text-foreground">
      <header className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border/40">
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
          {totalItems} وجبات
        </span>
        <h1 className="font-display text-2xl font-black text-right" dir="rtl">سلة المشتريات</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        {items.map((item) => (
          <div
            key={item.offer.id}
            className="relative flex gap-4 rounded-2xl border border-border/50 bg-card p-3.5 shadow-sm"
          >
            <img
              src={item.offer.image}
              alt={item.offer.name}
              className="size-20 rounded-xl object-cover shrink-0"
            />
            <div className="flex flex-1 flex-col justify-between min-w-0" dir="rtl">
              <div className="text-right">
                <h3 className="line-clamp-1 text-sm font-black text-foreground">{item.offer.name}</h3>
                <p className="text-xs font-bold text-muted-foreground/80 mt-0.5">{item.offer.restaurant}</p>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] font-black text-primary">
                  <Clock className="size-3 shrink-0" />
                  <span>{item.offer.pickupTime || "وقت الاستلام يحدده المطعم"}</span>
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-base font-black text-primary">
                  ₪{item.offer.discountedPrice.toFixed(2)}
                </span>
                <div className="flex items-center gap-3 rounded-full bg-secondary px-2.5 py-1">
                  <button
                    onClick={() => updateQuantity(item.offer.id, item.quantity - 1)}
                    className="flex size-6 items-center justify-center rounded-full bg-background text-sm font-black leading-none shadow-sm active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-xs font-black">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.offer.id, item.quantity + 1)}
                    className="flex size-6 items-center justify-center rounded-full bg-background text-sm font-black leading-none shadow-sm active:scale-90"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.offer.id)}
              className="absolute top-2 left-2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
              aria-label="Remove item"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}

        <PickupNotice items={items} />
        <PriceSummary subtotal={subtotal} />

        <div className="pt-2 pb-4">
          <button
            onClick={openCheckout}
            className="flex w-full items-center justify-between rounded-2xl bg-primary px-6 py-4 font-black text-primary-foreground shadow-card transition-all active:scale-95 hover:bg-primary-glow"
          >
            <span className="flex items-center gap-1.5">
              <span>الانتقال لإتمام الطلب</span>
              <ArrowLeft className="size-4" />
            </span>
            <span className="font-display text-base font-black">
              ₪{subtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </main>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeCheckout}
            aria-label="Close checkout"
          />

          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 z-10 rounded-t-3xl bg-background px-5 pt-3.5 pb-2 border-b border-border/40">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
              <div className="flex items-center justify-between" dir="rtl">
                <div className="flex items-center gap-2">
                  {step !== "options" && (
                    <button
                      onClick={() => setStep("options")}
                      className="rounded-full p-1.5 transition hover:bg-secondary"
                      aria-label="Back"
                    >
                      <ArrowRight className="size-5 text-foreground" />
                    </button>
                  )}
                  <h2 className="text-lg font-black text-foreground">
                    {step === "options" ? "خيارات الاستلام" : "تأكيد حجز طلبك"}
                  </h2>
                </div>
                <button
                  onClick={closeCheckout}
                  className="rounded-full p-1.5 transition hover:bg-secondary"
                  aria-label="Close"
                >
                  <X className="size-5 text-foreground" />
                </button>
              </div>
            </div>

            <div className="px-5 pb-8 pt-4">
              {step === "options" && (
                <CheckoutOptions items={items} onNext={() => setStep("confirm")} />
              )}

              {step === "confirm" && (
                <ConfirmOrder
                  items={items}
                  subtotal={subtotal}
                  checkingOut={checkingOut}
                  onPlaceOrder={handlePlaceOrder}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function CheckoutOptions({ items, onNext }: { items: CartItem[]; onNext: () => void }) {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="space-y-3 text-right">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          تفاصيل الاستلام من المطعم
        </h3>
        <PickupNotice items={items} />
      </div>

      <div className="space-y-3 text-right">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          طريقة الدفع المتاحة
        </h3>
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-white">
              <Banknote className="size-5" />
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-primary">نقداً عند الاستلام (كاش)</p>
              <p className="text-xs text-muted-foreground mt-0.5">الدفع مباشرة في المطعم عند استلام وجبتك.</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-black text-primary-foreground shadow-card transition-all active:scale-95 hover:bg-primary-glow"
      >
        <span>متابعة لتأكيد الطلب</span>
        <ArrowLeft className="size-5" />
      </button>
    </div>
  );
}

function ConfirmOrder({
  items,
  subtotal,
  checkingOut,
  onPlaceOrder,
}: {
  items: CartItem[];
  subtotal: number;
  checkingOut: boolean;
  onPlaceOrder: () => void;
}) {
  return (
    <div className="space-y-5" dir="rtl">
      <div className="space-y-3 text-right">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          ملخص الطلب المختار
        </h3>
        <div className="divide-y divide-border/50 rounded-2xl border border-border/50 bg-card">
          {items.map((item) => (
            <div key={item.offer.id} className="flex items-center gap-3 p-3">
              <img src={item.offer.image} alt="" className="size-12 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-black text-foreground">{item.offer.name}</p>
                <p className="text-[11px] font-bold text-muted-foreground mt-0.5">
                  {item.offer.restaurant} × {item.quantity}
                </p>
                <p className="mt-1 text-[10px] font-black text-primary flex items-center gap-1">
                  <Clock className="size-3 shrink-0" />
                  <span>{item.offer.pickupTime || "وقت الاستلام يحدده المطعم"}</span>
                </p>
              </div>
              <span className="text-sm font-black text-primary shrink-0">
                ₪{(item.offer.discountedPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DetailCard label="طريقة الاستلام" value="استلام من المطعم" icon={Store} />
        <DetailCard label="نافذة الاستلام" value="حسب وقت المطعم" icon={Clock} />
        <DetailCard label="طريقة الدفع" value="كاش في المطعم" icon={Banknote} wide />
      </div>

      <PriceSummary subtotal={subtotal} />

      <button
        onClick={onPlaceOrder}
        disabled={checkingOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-black text-primary-foreground shadow-card transition-all active:scale-95 disabled:scale-100 disabled:opacity-70 hover:bg-primary-glow"
      >
        {checkingOut ? (
          <span>جاري إرسال طلبك...</span>
        ) : (
          <>
            <Check className="size-5" />
            <span>تأكيد الحجز الفعلي · ₪{subtotal.toFixed(2)}</span>
          </>
        )}
      </button>
    </div>
  );
}

function PickupNotice({ items }: { items: CartItem[] }) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-right" dir="rtl">
      <p className="text-xs font-black text-primary leading-relaxed">
        🚨 تنبيه هام: وقت الاستلام ثابت حسب نافذة المطعم. يرجى الالتزام بالوقت المحدد لضمان جودة الوجبة.
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.offer.id} className="flex items-start justify-between gap-3 text-[11px] font-bold">
            <span className="text-foreground leading-normal">{item.offer.name}</span>
            <span className="shrink-0 text-primary font-black">
              {item.offer.pickupTime || "يحدده المطعم"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
  icon: Icon,
  wide = false,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border/50 bg-card p-3 text-center shadow-sm ${wide ? "col-span-2" : ""}`}
    >
      <div className="mb-1 text-[9px] font-black uppercase text-muted-foreground">{label}</div>
      <div className="flex items-center justify-center gap-1.5 mt-0.5">
        <Icon className="size-4 text-primary shrink-0" />
        <span className="text-xs font-black text-foreground">{value}</span>
      </div>
    </div>
  );
}

function PriceSummary({ subtotal }: { subtotal: number }) {
  const basePrice = subtotal / 1.20;
  const serviceFee = subtotal - basePrice;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm" dir="rtl">
      <div className="flex justify-between text-xs font-bold text-right">
        <span className="text-muted-foreground">سعر الوجبات من المطاعم:</span>
        <span className="font-semibold text-gray-700">₪{basePrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs font-bold text-right">
        <span className="text-muted-foreground">رسوم خدمة سيلكتو (20%):</span>
        <span className="font-semibold text-gray-700">₪{serviceFee.toFixed(2)}</span>
      </div>
      <hr className="border-border/50" />
      <div className="flex justify-between text-base font-black text-right">
        <span className="text-primary">الإجمالي المطلوب دفعه:</span>
        <span className="text-primary">₪{subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
}

function getPickupSummary(items: CartItem[]) {
  return items
    .map((item) => `${item.offer.name}: ${item.offer.pickupTime || "restaurant pickup window"}`)
    .join(" | ");
}
