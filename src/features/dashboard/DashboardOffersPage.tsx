import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth.context";
import { getMyOffers, deactivateOffer } from "@/features/dashboard/restaurant.functions";
import { discountPct } from "@/features/offers/offers.service";

import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/offers/")({
  component: OffersList,
});

function OffersList() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const list = await getMyOffers();
        setOffers(list);
      } catch (err: any) {
        toast.error(err.message || "Failed to load offers");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function deleteOffer(id: string) {
    if (!confirm("هل أنت متأكد من تعطيل هذا العرض؟ سيتم الاحتفاظ بالمعاملات التاريخية.")) return;
    try {
      await deactivateOffer({ data: { id } });
      toast.success("تم تعطيل العرض بنجاح");
      // Keep it in the list but update active status
      setOffers((prev) => prev.map((o) => o.id === id ? { ...o, active: false } : o));
    } catch (err: any) {
      toast.error(err.message || "فشل في تعطيل العرض");
    }
  }

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold">قائمة طعامي</h1>
        <Link to="/dashboard/offers/new" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-card">
          + إضافة وجبة
        </Link>
      </header>

      {loading ? (
        <p className="py-10 text-center text-xs text-muted-foreground">جاري التحميل...</p>
      ) : offers.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
          لم تقم بإضافة أي وجبات بعد.
        </p>
      ) : (
        <ul className="space-y-3">
          {offers.map((o) => {
            const finalPrice = o.discountedPrice;
            const payout = o.restaurantPrice;
            const commission = finalPrice - payout;

            return (
              <li key={o.id} className={`flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card ${!o.active && 'opacity-60 grayscale'}`}>
                <img src={o.image} alt={o.name} loading="lazy" className="size-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{o.name}</p>
                    <span className="rounded-md bg-discount px-1.5 py-0.5 text-[10px] font-bold text-discount-foreground">
                      خصم {discountPct(o)}%
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <p>الاستلام: <span className="font-semibold text-primary">{o.pickupTime}</span></p>
                    <p>السعر الأصلي: <span className="line-through">₪{o.originalPrice.toFixed(2)}</span></p>
                    <p>المستحق: <span className="font-semibold text-foreground">₪{payout.toFixed(2)}</span></p>
                    <p className="mt-1 font-bold text-primary">
                      سعر العميل: ₪{finalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/dashboard/offers/edit/$id"
                    params={{ id: o.id }}
                    className="grid size-9 place-items-center rounded-full bg-secondary text-primary hover:bg-primary hover:text-white transition"
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  {o.active && (
                    <button
                      onClick={() => deleteOffer(o.id)}
                      className="grid size-9 place-items-center rounded-full bg-secondary text-destructive hover:bg-destructive hover:text-white transition"
                      aria-label="Deactivate"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
