import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  discountPct,
  fallbackOffers,
  fetchPublicOffers,
  type Offer,
} from "@/lib/offers-data";
import { useCustomerGuard } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Selecto" },
      { name: "description", content: "Your saved restaurants and meals on Selecto." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const [tab, setTab] = useState<"Restaurants" | "Meals">("Restaurants");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { ids, toggle } = useFavorites();
  useCustomerGuard();

  useEffect(() => {
    fetchPublicOffers()
      .then((data) => setOffers(data.length ? data : fallbackOffers))
      .catch(() => setOffers(fallbackOffers))
      .finally(() => setLoading(false));
  }, []);

  const saved = offers.filter((offer) => ids.includes(offer.id));

  return (
    <div className="phone-frame flex min-h-screen flex-col">
      <header className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold">Favorites</h1>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {saved.length} saved
          </span>
        </div>
        <div className="mt-4 flex rounded-full bg-secondary p-1 text-xs font-semibold">
          {(["Restaurants", "Meals"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex-1 rounded-full py-2 transition ${
                tab === value ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 space-y-3 px-4 pb-6">
        {loading ? (
          <p className="py-10 text-center text-xs text-muted-foreground">Loading...</p>
        ) : saved.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-secondary text-discount">
              <Heart className="size-7" />
            </div>
            <h2 className="font-display text-lg font-bold">No favorites yet</h2>
            <p className="text-sm text-muted-foreground">
              Save offers you like and they will appear here.
            </p>
            <Link
              to="/offers"
              className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-card"
            >
              Browse offers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((offer) => (
              <Link
                key={offer.id}
                to="/offer/$id"
                params={{ id: offer.id }}
                className="flex items-center gap-3 rounded-2xl bg-card p-2.5 shadow-card transition hover:-translate-y-0.5"
              >
                <img
                  src={offer.image}
                  alt={offer.name}
                  loading="lazy"
                  className="size-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{offer.restaurant}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {offer.cuisine} · {offer.distanceKm} km
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-0.5 font-semibold">
                      <Star className="size-3 fill-primary text-primary" />
                      {offer.rating}
                    </span>
                    <span className="rounded bg-discount px-1.5 py-0.5 font-bold text-discount-foreground">
                      {discountPct(offer)}% OFF
                    </span>
                  </div>
                </div>
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    toggle(offer.id);
                  }}
                  className="p-2 text-discount"
                  aria-label="Remove favorite"
                >
                  <Heart className="size-4 fill-discount" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
