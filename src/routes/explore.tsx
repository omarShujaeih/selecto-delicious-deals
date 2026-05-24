import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfferCard } from "@/components/offers/OfferCard";
import { fetchPublicOffers, type Offer } from "@/lib/offers-data";
import { useCustomerGuard } from "@/lib/auth-context";
import { withTimeout } from "@/lib/async-timeout";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "استكشاف العروض | Selecto" },
      { name: "description", content: "ابحث وفلتر عروض المطاعم على Selecto." },
    ],
  }),
  component: ExplorePage,
});

const cuisines = ["الكل", "Palestinian", "Arabic", "Burgers", "Italian", "Cafe"];
const sorts = ["الأعلى تقييماً", "الأقرب", "أكبر خصم"] as const;

function ExplorePage() {
  const [cuisine, setCuisine] = useState("الكل");
  const [sort, setSort] = useState<(typeof sorts)[number]>("الأعلى تقييماً");
  const [query, setQuery] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useCustomerGuard();

  useEffect(() => {
    withTimeout(fetchPublicOffers(), 8000, "Loading explore offers")
      .then((data) => {
        setOffers(data);
        setLoadError(null);
      })
      .catch(() => {
        setOffers([]);
        setLoadError("تعذر تحميل العروض.");
      })
      .finally(() => setLoading(false));
  }, []);

  const list = offers
    .filter((offer) => {
      const cuisineMatch = cuisine === "الكل" || offer.cuisine.toLowerCase().includes(cuisine.toLowerCase());
      const text = `${offer.name} ${offer.restaurant} ${offer.cuisine}`.toLowerCase();
      return cuisineMatch && (!query.trim() || text.includes(query.trim().toLowerCase()));
    })
    .sort((a, b) => {
      if (sort === "الأقرب") return a.distanceKm - b.distanceKm;
      if (sort === "أكبر خصم") return b.originalPrice - b.discountedPrice - (a.originalPrice - a.discountedPrice);
      return b.rating - a.rating;
    });

  return (
    <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link to="/offers" className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary">
            <ArrowRight className="size-5" />
          </Link>
          <h1 className="font-display text-xl font-black">استكشاف العروض</h1>
          <span className="size-10" />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="ابحث عن مطعم أو وجبة"
            className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select
            value={sort}
            onChange={(event) => setSort(event.currentTarget.value as (typeof sorts)[number])}
            className="rounded-2xl border border-border bg-card px-3 py-3 text-xs font-black outline-none"
          >
            {sorts.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select
            value={cuisine}
            onChange={(event) => setCuisine(event.currentTarget.value)}
            className="rounded-2xl border border-border bg-card px-3 py-3 text-xs font-black outline-none"
          >
            {cuisines.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </header>

      <main className="space-y-4 px-5 py-5">
        {loading && <StateCard title="جاري تحميل العروض..." />}
        {!loading && loadError && <StateCard title={loadError} />}
        {!loading && !loadError && list.length === 0 && <StateCard title="لا توجد عروض مطابقة للبحث." />}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {!loading && !loadError && list.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function StateCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm font-black text-muted-foreground">
      {title}
    </div>
  );
}
