import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfferCard } from "@/components/offers/OfferCard";
import { fallbackOffers, fetchPublicOffers, type Offer } from "@/lib/offers-data";
import { useCustomerGuard } from "@/lib/auth-context";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Selecto" },
      { name: "description", content: "Filter discounted meals by cuisine, rating, and distance." },
    ],
  }),
  component: ExplorePage,
});

const cuisines = ["All", "Levantine", "Burgers & Grill", "Italian", "Desserts", "Palestinian", "Arabic"];
const sorts = ["Rating", "Distance", "Discount"] as const;

function ExplorePage() {
  const [cuisine, setCuisine] = useState("All");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Rating");
  const [minRating, setMinRating] = useState(0);
  const [q, setQ] = useState("");
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  useCustomerGuard();

  useEffect(() => {
    fetchPublicOffers()
      .then((d) => setOffersList(d.length ? d : fallbackOffers))
      .catch(() => setOffersList(fallbackOffers))
      .finally(() => setLoading(false));
  }, []);

  const list = offersList
    .filter(
      (o) =>
        (cuisine === "All" || o.cuisine.toLowerCase().includes(cuisine.toLowerCase())) &&
        (q === "" ||
          o.name.toLowerCase().includes(q.toLowerCase()) ||
          o.restaurant.toLowerCase().includes(q.toLowerCase()) ||
          o.cuisine.toLowerCase().includes(q.toLowerCase())) &&
        o.rating >= minRating
    )
    .sort((a, b) => {
      if (sort === "Rating") return b.rating - a.rating;
      if (sort === "Distance") return a.distanceKm - b.distanceKm;
      return b.originalPrice - b.discountedPrice - (a.originalPrice - a.discountedPrice);
    });

  return (
    <div className="phone-frame flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 bg-background/95 px-4 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link
            to="/offers"
            className="grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-base font-bold">Explore</h1>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-card px-3 py-2.5 shadow-card">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cuisine, restaurant or dish…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
            className="rounded-full bg-card px-3 py-2 font-semibold shadow-card outline-none"
          >
            {sorts.map((s) => (
              <option key={s} value={s}>Sort: {s}</option>
            ))}
          </select>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="rounded-full bg-card px-3 py-2 font-semibold shadow-card outline-none"
          >
            {cuisines.map((c) => (
              <option key={c} value={c}>Cuisine: {c}</option>
            ))}
          </select>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="rounded-full bg-card px-3 py-2 font-semibold shadow-card outline-none"
          >
            <option value={0}>Any rating</option>
            <option value={4}>4.0+</option>
            <option value={4.5}>4.5+</option>
          </select>
        </div>
      </header>

      <main className="flex-1 space-y-3 px-4 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {q || cuisine !== "All" || minRating > 0 ? "Search Results" : "Recommended for you"}
        </p>
        
        {loading && <p className="py-10 text-center text-xs text-muted-foreground">Loading explore offers…</p>}
        
        {!loading && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        )}
        
        {!loading && list.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground animate-fade-in">
            No offers match your criteria. Try adjusting filters or search query!
          </p>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
