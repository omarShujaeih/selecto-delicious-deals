import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BottomNav } from "@/components/layout/BottomNav";
import { withTimeout } from "@/lib/async-timeout";
import { useAuth, useCustomerGuard } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites";
import {
  discountPct,
  fetchOfferById,
  formatILS,
  MAX_CART_QUANTITY,
  type Offer,
} from "@/lib/offers-data";

export const Route = createFileRoute("/offer/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل العرض | Selecto" },
      {
        name: "description",
        content: "راجع تفاصيل الوجبة واحجزها عبر Selecto.",
      },
    ],
  }),
  component: OfferDetailsPage,
});

const cityLabels: Record<string, string> = {
  Ramallah: "رام الله",
  Nablus: "نابلس",
  Hebron: "الخليل",
  Bethlehem: "بيت لحم",
  Jerusalem: "القدس",
  Jenin: "جنين",
  Tulkarm: "طولكرم",
  Qalqilya: "قلقيلية",
  Jericho: "أريحا",
};

function OfferDetailsPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { has, toggle } = useFavorites();
  const [offer, setOffer] = useState<(Offer & { restaurant_id?: string }) | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useCustomerGuard();

  useEffect(() => {
    let active = true;

    withTimeout(fetchOfferById(id), 8000, "Loading offer")
      .then((data) => {
        if (!active) return;
        setOffer(data);
        setError(data ? null : "هذا العرض غير متوفر حالياً.");
      })
      .catch(() => {
        if (!active) return;
        setError("تعذر تحميل تفاصيل العرض.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <PageState title="جاري تحميل تفاصيل العرض..." />;
  if (!offer) {
    return (
      <PageState
        title={error || "العرض غير متوفر"}
        actionLabel="العودة للعروض"
      />
    );
  }

  const maxQuantity = Math.min(
    offer.availableQuantity ?? MAX_CART_QUANTITY,
    MAX_CART_QUANTITY,
  );
  const favorite = has(offer.id);
  const location = offer.city ? cityLabels[offer.city] || offer.city : "قريب منك";

  function addToCart() {
    if (!offer) return;

    if (!user) {
      toast.info("سجل دخولك لإتمام الحجز.");
      router.navigate({
        to: "/auth",
        search: { redirect: `/offer/${offer.id}` },
      });
      return;
    }

    addItem(offer, quantity);
    toast.success("تمت إضافة الوجبة للسلة.");
    router.navigate({ to: "/cart" });
  }

  return (
    <div className="phone-frame min-h-screen bg-background pb-24 text-foreground">
      <header className="relative h-[360px] overflow-hidden bg-primary">
        <img src={offer.image} alt={offer.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/35" />

        <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between px-5">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="grid size-11 place-items-center rounded-2xl bg-white/16 text-white backdrop-blur"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                toast.info("سجل دخولك لحفظ العرض.");
                router.navigate({ to: "/auth" });
                return;
              }
              toggle(offer.id);
              toast.success(
                favorite ? "تمت الإزالة من المفضلة" : "تم الحفظ في المفضلة",
              );
            }}
            className="grid size-11 place-items-center rounded-2xl bg-white/16 text-white backdrop-blur"
            aria-label="المفضلة"
          >
            <Heart
              className={`size-5 ${favorite ? "fill-discount text-discount" : ""}`}
            />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 text-white" dir="rtl">
          <div className="flex items-center gap-2 text-xs font-black text-white/85">
            <span>{offer.restaurant}</span>
            <span className="size-1 rounded-full bg-white/50" />
            <span>{offer.cuisine}</span>
          </div>
          <h1 className="font-display text-3xl font-black leading-tight">
            {offer.name}
          </h1>
        </div>
      </header>

      <main className="space-y-5 px-5 pt-5" dir="rtl">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black text-muted-foreground">
                السعر النهائي
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-black text-primary">
                  {formatILS(offer.discountedPrice)}
                </span>
                <span className="text-sm font-bold text-muted-foreground line-through">
                  {formatILS(offer.originalPrice)}
                </span>
              </div>
            </div>
            <span className="rounded-full bg-discount/10 px-3 py-1.5 text-xs font-black text-discount">
              خصم {discountPct(offer)}%
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <InfoCard icon={Clock} label="وقت الاستلام" value={offer.pickupTime || "يحدده المطعم"} />
          <InfoCard icon={MapPin} label="الموقع" value={location} />
          <InfoCard icon={ShoppingBag} label="الكمية المتاحة" value={`${maxQuantity} وجبات`} />
          <InfoCard icon={Star} label="التقييم" value={`${offer.rating || 4.5}`} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="font-display text-lg font-black">تفاصيل الوجبة</h2>
          <p className="mt-2 text-sm font-semibold leading-7 text-muted-foreground">
            {offer.description ||
              "وجبة مختارة من مطعم محلي، متاحة ضمن وقت الاستلام المحدد وبسعر نهائي واضح."}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black">الكمية</p>
              <p className="text-xs font-bold text-muted-foreground">
                الحد الأقصى {maxQuantity}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-secondary px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="grid size-8 place-items-center rounded-full bg-card text-primary"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center text-sm font-black">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
                className="grid size-8 place-items-center rounded-full bg-card text-primary disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[1200px] border-t border-border bg-background/95 px-5 pt-3 backdrop-blur">
        <button
          type="button"
          onClick={addToCart}
          className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-sm font-black text-primary-foreground shadow-card"
        >
          <span>أضف إلى السلة</span>
          <span>{formatILS(offer.discountedPrice * quantity)}</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 text-[11px] font-black text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

function PageState({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <div className="phone-frame grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="text-sm font-black text-muted-foreground">{title}</p>
        {actionLabel && (
          <Link
            to="/offers"
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
