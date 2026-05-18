import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { OfferCard } from "@/components/OfferCard";
import { offers } from "@/lib/sample-data";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Selecto" },
      { name: "description", content: "Filter discounted meals by cuisine, rating, and distance." },
    ],
  }),
  component: ExplorePage,
});

const cuisines = ["All", "Asian", "Italian", "American", "Japanese"];
const sorts = ["Rating", "Distance", "Discount"] as const;

function ExplorePage() {
  const [cuisine, setCuisine] = useState("All");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Rating");
  const [minRating, setMinRating] = useState(0);

  const list = offers
    .filter((o) => cuisine === "All" || o.cuisine.includes(cuisine))
    .filter((o) => o.rating >= minRating)
    .sort((a, b) => {
      if (sort === "Rating") return b.rating - a.rating;
      if (sort === "Distance") return a.distanceKm - b.distanceKm;
      return b.originalPrice - b.discountedPrice - (a.originalPrice - a.discountedPrice);
    });

  return (
    <div className="phone-frame flex flex-col">
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
            placeholder="Search cuisine, restaurant or dish…"
            className="flex-1 bg-transparent text-sm outline-none"
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
          Recommended for you
        </p>
        {list.map((o) => (
          <OfferCard key={o.id} offer={o} />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
