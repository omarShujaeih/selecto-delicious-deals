import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus, Star } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { discountPct, offers } from "@/lib/sample-data";
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
  const { ids, toggle } = useFavorites();
  const saved = offers.filter((o) => ids.includes(o.id));
  const seedSamples = offers.slice(0, 4);
  const list = saved.length ? saved : seedSamples;

  return (
    <div className="phone-frame flex flex-col">
      <header className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold">Favorites</h1>
          <button className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground" aria-label="Add">
            <Plus className="size-4" />
          </button>
        </div>
        <div className="mt-4 flex rounded-full bg-secondary p-1 text-xs font-semibold">
          {(["Restaurants", "Meals"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2 transition ${
                tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 space-y-3 px-4 pb-6">
        {!saved.length && (
          <p className="rounded-xl bg-secondary/60 px-3 py-2 text-center text-[11px] text-muted-foreground">
            Sample favorites — tap the heart on any offer to save your own.
          </p>
        )}
        {list.map((o) => (
          <Link
            key={o.id}
            to="/offer/$id"
            params={{ id: o.id }}
            className="flex items-center gap-3 rounded-2xl bg-card p-2.5 shadow-card transition hover:-translate-y-0.5"
          >
            <img
              src={o.image}
              alt={o.name}
              loading="lazy"
              className="size-16 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold">{o.restaurant}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {o.cuisine} · {o.distanceKm} km
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-0.5 font-semibold">
                  <Star className="size-3 fill-primary text-primary" />
                  {o.rating}
                </span>
                <span className="rounded bg-discount px-1.5 py-0.5 font-bold text-discount-foreground">
                  {discountPct(o)}% OFF
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggle(o.id);
              }}
              className="p-2 text-discount"
              aria-label="Toggle favorite"
            >
              <Heart className={`size-4 ${ids.includes(o.id) ? "fill-discount" : ""}`} />
            </button>
          </Link>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
