import { useCustomerGuard } from "@/features/auth/auth.context";
import { fetchRestaurantActiveOffers, fetchRestaurantById, type Offer } from "@/features/offers/offers.service";
import { OfferCard } from "@/features/offers/OfferCard";
import { BottomNav } from "@/shared/layout/BottomNav";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronRight, MapPin, Store } from "lucide-react";
import { useEffect, useState } from "react";

export function RestaurantDetailsPage() {
  useCustomerGuard();
  const { id } = useParams({ from: "/restaurants/$id" });

  const [restaurant, setRestaurant] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [resData, offersData] = await Promise.all([
          fetchRestaurantById(id),
          fetchRestaurantActiveOffers(id),
        ]);
        if (!active) return;
        setRestaurant(resData);
        setOffers(offersData);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "تعذر تحميل بيانات المطعم.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
        <header className="sticky top-0 z-30 bg-primary px-5 pb-4 text-primary-foreground shadow-card safe-top">
          <div className="flex items-center gap-3">
            <Link to="/offers" className="rounded-full bg-white/10 p-2 text-white">
              <ChevronRight className="size-5" />
            </Link>
            <h1 className="font-display text-xl font-black">جاري التحميل...</h1>
          </div>
        </header>
        <div className="p-5 text-center text-sm text-muted-foreground animate-pulse">
          بنجهزلك قائمة المطعم...
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
        <header className="sticky top-0 z-30 bg-primary px-5 pb-4 text-primary-foreground shadow-card safe-top">
          <div className="flex items-center gap-3">
            <Link to="/offers" className="rounded-full bg-white/10 p-2 text-white">
              <ChevronRight className="size-5" />
            </Link>
            <h1 className="font-display text-xl font-black">خطأ</h1>
          </div>
        </header>
        <div className="p-5 text-center text-sm font-bold text-destructive">
          {error || "المطعم غير موجود."}
        </div>
      </div>
    );
  }

  return (
    <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-30 bg-primary px-5 pb-4 text-primary-foreground shadow-card safe-top">
        <div className="flex items-center gap-3">
          <Link to="/offers" className="rounded-full bg-white/10 p-2 text-white">
            <ChevronRight className="size-5" />
          </Link>
          <div className="flex-1 overflow-hidden">
            <h1 className="truncate font-display text-xl font-black">{restaurant.name}</h1>
          </div>
        </div>
      </header>

      <main className="px-5 pt-5 pb-6 space-y-6">
        {/* Restaurant Header Info */}
        <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm border border-border/50">
          <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Store className="size-8" />
          </div>
          <div>
            <h2 className="font-display text-lg font-black">{restaurant.name}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{restaurant.cuisine}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <MapPin className="size-3" />
              {restaurant.city} {restaurant.address ? `· ${restaurant.address}` : ""}
            </p>
          </div>
        </div>

        {/* Offers Section */}
        <section className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-black">هاي عروض المطعم المتاحة اليوم</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              متوفر {offers.length} عروض جاهزة للحجز
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
              <p className="text-sm font-black text-foreground">للأسف، لا توجد عروض متاحة حالياً</p>
              <p className="mx-auto mt-2 max-w-xs text-xs font-semibold leading-6 text-muted-foreground">
                المطعم ما نزل عروض اليوم، ارجع شيك بعدين أو شوف مطاعم ثانية.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
