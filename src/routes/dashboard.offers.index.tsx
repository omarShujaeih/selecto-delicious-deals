import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchMyOffers, fetchMyRestaurant } from "@/lib/offers-data";
import { discountPct } from "@/lib/sample-data";
import type { Offer } from "@/lib/sample-data";

export const Route = createFileRoute("/dashboard/offers/")({
  component: OffersList,
});

function OffersList() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const r = await fetchMyRestaurant(user.id);
      if (r) setOffers(await fetchMyOffers(r.id));
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold">My Offers</h1>
        <Link to="/dashboard/offers/new" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-card">
          + Add Offer
        </Link>
      </header>

      {loading ? (
        <p className="py-10 text-center text-xs text-muted-foreground">Loading…</p>
      ) : offers.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
          You haven't added any offers yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {offers.map((o) => (
            <li key={o.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
              <img src={o.image} alt={o.name} loading="lazy" className="size-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{o.name}</p>
                  <span className="rounded-md bg-discount px-1.5 py-0.5 text-[10px] font-bold text-discount-foreground">
                    {discountPct(o)}% OFF
                  </span>
                </div>
                <div className="mt-0.5 flex items-baseline gap-2 text-xs">
                  <span className="text-muted-foreground line-through">${o.originalPrice.toFixed(2)}</span>
                  <span className="font-bold">${o.discountedPrice.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Valid till {o.validUntil}</p>
              </div>
              <button className="grid size-9 place-items-center rounded-full bg-secondary text-primary" aria-label="Edit">
                <Pencil className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
