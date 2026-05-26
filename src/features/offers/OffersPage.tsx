import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, MapPin, Search, Store } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { BottomNav } from "@/shared/layout/BottomNav";
import { OfferCard } from "@/features/offers/OfferCard";
import { categories, fetchPublicOffers, type Offer } from "@/features/offers/offers.service";
import { useCustomerGuard } from "@/features/auth/auth.context";
import { withTimeout } from "@/shared/lib/async-timeout";
import { cities, getPreferredCity, setPreferredCity } from "@/features/customer/city-preference";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Selecto | عروض اليوم" }] }),
  component: OffersPage,
});

const categoryLabels: Record<string, string> = { All: "الكل" };

function RestaurantsCarousel({ offers }: { offers: Offer[] }) {
  const restaurantsMap = new Map<string, any>();
  offers.forEach((offer) => {
    if (!restaurantsMap.has(offer.restaurant_id)) {
      restaurantsMap.set(offer.restaurant_id, {
        id: offer.restaurant_id,
        name: offer.restaurant,
        cuisine: offer.cuisine,
        city: offer.city,
        area: offer.area,
        offerCount: 0,
        bestDiscount: 0,
      });
    }
    const r = restaurantsMap.get(offer.restaurant_id);
    r.offerCount += 1;
    const discount = Math.round(((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100);
    if (discount > r.bestDiscount) r.bestDiscount = discount;
  });

  const restaurants = Array.from(restaurantsMap.values());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (restaurants.length <= 1) return;
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % restaurants.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [restaurants.length, isPaused]);

  useEffect(() => {
    if (scrollRef.current && restaurants.length > 0) {
      const card = scrollRef.current.children[activeIndex] as HTMLElement;
      if (card) {
        scrollRef.current.scrollTo({
          left: card.offsetLeft,
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex, restaurants.length]);

  if (restaurants.length === 0) return null;

  return (
    <section className="space-y-3 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black">المطاعم المتاحة</h2>
          <p className="text-xs text-muted-foreground mt-0.5">اختار مطعمك وشوف العروض المتوفرة عنده.</p>
        </div>
        <Link to="/restaurants" className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
          عرض الكل
        </Link>
      </div>

      <div
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 no-scrollbar"
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {restaurants.map((r) => (
          <Link
            key={r.id}
            to="/restaurants/$id"
            params={{ id: r.id }}
            className="w-[85vw] md:w-[40vw] shrink-0 snap-center rounded-2xl bg-card p-4 shadow-sm border border-border/50 flex flex-col gap-3 transition hover:-translate-y-0.5"
          >
            <div className="flex gap-3">
              <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Store className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-black">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.cuisine}</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                  <MapPin className="size-3" /> {r.city}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
              <div className="flex gap-2 items-center flex-wrap">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                  {r.offerCount} عروض اليوم
                </span>
                {r.bestDiscount > 0 && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-black text-destructive">
                    خصم {r.bestDiscount}%
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black text-primary shrink-0">عرض الوجبات</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OffersPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState(getPreferredCity);
  useCustomerGuard();

  useEffect(() => {
    withTimeout(fetchPublicOffers(), 8000, "Loading offers")
      .then((data) => { setOffers(data); setLoadError(null); })
      .catch(() => { setOffers([]); setLoadError("تعذر تحميل العروض. حاول مرة أخرى."); })
      .finally(() => setLoading(false));
  }, []);

  const list = offers.filter((offer) => {
    const cityMatch = (offer.city || "Ramallah").toLowerCase() === selectedCity.toLowerCase();
    const categoryMatch = category === "All" || offer.category === category;
    const text = `${offer.name} ${offer.restaurant} ${offer.cuisine}`.toLowerCase();
    return cityMatch && categoryMatch && (!query.trim() || text.includes(query.trim().toLowerCase()));
  });

  return (
    <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-30 bg-primary px-5 pb-4 text-primary-foreground shadow-card safe-top">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-black" dir="ltr">Selecto</h1>
          <button className="grid size-11 place-items-center rounded-2xl bg-white/10"><Bell className="size-5" /></button>
        </div>
        
        <div className="mt-4 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90 w-max">
          <MapPin className="size-3.5" />
          <span>العروض في:</span>
          <select 
            value={selectedCity} 
            onChange={(e) => { setSelectedCity(e.target.value); setPreferredCity(e.target.value); }} 
            className="bg-transparent text-xs font-black text-white outline-none"
          >
            {cities.map((city) => <option key={city.value} value={city.value} className="bg-primary">{city.label}</option>)}
          </select>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3">
          <Search className="size-4 text-white/70" />
          <input value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder="ابحث عن لقطة أو مطعم" className="min-w-0 flex-1 bg-transparent text-base font-bold text-white outline-none placeholder:text-white/55" />
        </div>
      </header>
      <main className="space-y-5 px-5 pt-5">
        <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card p-4 shadow-sm" dir="rtl">
          <div className="absolute -left-10 -top-10 size-28 rounded-full bg-primary/10" />
          <div className="relative">
            <p className="text-xs font-black text-primary">لقطات اليوم</p>
            <h2 className="mt-1 font-display text-2xl font-black leading-tight">صيدها في الدقيقة الـ90 يا غالي</h2>
            <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">اختر مدينتك وشوف العروض القريبة منك. أكلة بتشبع وسعر ما بيوجع.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-black text-primary">آخر الشهر؟ Selecto معك</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-black text-primary">لقطة سكنات ودوام</span>
            </div>
          </div>
        </section>

        {!loading && !loadError && <RestaurantsCarousel offers={list} />}

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-black ${category === item ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>
              {categoryLabels[item] ?? item}
            </button>
          ))}
        </div>
        <section className="space-y-3 pb-6">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-black">متوفر الآن</h2><Link to="/explore" className="text-xs font-black text-primary">عرض الكل</Link></div>
          {loading && <StateCard title="بنفتشلك على اللقطات..." />}
          {!loading && loadError && <StateCard title={loadError} />}
          {!loading && !loadError && list.length === 0 && <StateCard title="لسه ما في عروض هون" subtitle="جرّب مدينة ثانية، أو ارجع بعد شوي… يمكن اللقطة الجاية تكون إلك." />}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{!loading && !loadError && list.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function StateCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
      <p className="text-sm font-black text-foreground">{title}</p>
      {subtitle && <p className="mx-auto mt-2 max-w-xs text-xs font-semibold leading-6 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
