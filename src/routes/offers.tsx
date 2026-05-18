import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { OfferCard } from "@/components/OfferCard";
import { categories, offers as fallbackOffers, type Offer } from "@/lib/sample-data";
import { fetchPublicOffers } from "@/lib/offers-data";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers — Selecto" },
      { name: "description", content: "Top discounted meals from local restaurants on Selecto." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [q, setQ] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicOffers()
      .then((d) => setOffers(d.length ? d : fallbackOffers))
      .catch(() => setOffers(fallbackOffers))
      .finally(() => setLoading(false));
  }, []);

  const list = offers.filter(
    (o) =>
      (cat === "All" || o.category === cat) &&
      (q === "" ||
        o.name.toLowerCase().includes(q.toLowerCase()) ||
        o.restaurant.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="phone-frame flex flex-col">
      <header className="sticky top-0 z-20 bg-background/95 px-4 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-1 text-sm font-semibold">
            New York, USA <ChevronDown className="size-4" />
          </button>
          <button
            className="grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-card px-3 py-2.5 shadow-card">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for restaurants or meals…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Link
            to="/explore"
            className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-card"
            aria-label="Filters"
          >
            <SlidersHorizontal className="size-4" />
          </Link>
        </div>
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 space-y-5 px-4 pb-6">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-glow p-5 text-primary-foreground shadow-elevated">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Featured</p>
          <h2 className="mt-1 font-display text-xl font-extrabold leading-tight">
            Delicious Meals
            <br />
            at Discounted Prices
          </h2>
          <p className="mt-1 text-xs opacity-90">Up to 50% off · Today only</p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">Top Meal Offers</h2>
            <Link to="/explore" className="text-xs font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {loading && <p className="py-6 text-center text-xs text-muted-foreground">Loading offers…</p>}
            {!loading && list.map((o) => <OfferCard key={o.id} offer={o} />)}
            {!loading && list.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No offers match your search.
              </p>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
