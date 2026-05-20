import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { discountPct, fetchMyOffers, fetchMyRestaurant, type Offer } from "@/lib/offers-data";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  async function deleteOffer(id: string) {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete offer");
    } else {
      toast.success("Offer deleted successfully");
      setOffers((prev) => prev.filter((o) => o.id !== id));
    }
  }

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
                  <span className="text-muted-foreground line-through">₪{o.originalPrice.toFixed(2)}</span>
                  <span className="font-bold">₪{o.discountedPrice.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Valid till {o.validUntil}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link 
                  to="/dashboard/offers/edit/$id" 
                  params={{ id: o.id }}
                  className="grid size-9 place-items-center rounded-full bg-secondary text-primary hover:bg-primary hover:text-white transition" 
                  aria-label="Edit"
                >
                  <Pencil className="size-4" />
                </Link>
                <button 
                  onClick={() => deleteOffer(o.id)}
                  className="grid size-9 place-items-center rounded-full bg-secondary text-destructive hover:bg-destructive hover:text-white transition" 
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
