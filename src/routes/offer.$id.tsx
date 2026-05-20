import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Clock, Heart, MapPin, Share2, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { discountPct, offerById as fallbackOffer } from "@/lib/sample-data";
import type { Offer } from "@/lib/sample-data";
import { useFavorites } from "@/lib/favorites";
import { fetchOfferById } from "@/lib/offers-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/offer/$id")({
  head: () => ({
    meta: [
      { title: "Offer — Selecto" },
      { name: "description", content: "Discounted meal offer" },
    ],
  }),
  component: OfferDetails,
});

function OfferDetails() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { toggle, has } = useFavorites();
  const { user } = useAuth();
  const [offer, setOffer] = useState<(Offer & { restaurant_id?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchOfferById(id)
      .then((o) => setOffer(o ?? fallbackOffer(id) ?? null))
      .catch(() => setOffer(fallbackOffer(id) ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="phone-frame grid place-items-center p-8 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!offer) {
    return (
      <div className="phone-frame grid place-items-center p-8 text-center">
        <p>Offer not found.</p>
      </div>
    );
  }

  const fav = has(offer.id);
  const pct = discountPct(offer);
  const saved = (offer.originalPrice - offer.discountedPrice).toFixed(2);

  async function order() {
    if (!user) {
      toast.error("Please sign in to place an order");
      router.navigate({ to: "/auth" });
      return;
    }
    if (!offer!.restaurant_id) {
      toast.error("This is a demo offer — sign up restaurants to enable real orders.");
      return;
    }
    setPlacing(true);
    const { error } = await supabase.from("transactions").insert({
      offer_id: offer!.id,
      restaurant_id: offer!.restaurant_id,
      customer_id: user.id,
      sale_amount: offer!.discountedPrice,
    });
    setPlacing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Order placed!");
    router.navigate({ to: "/orders" });
  }

  return (
    <div className="phone-frame flex flex-col">
      <div className="relative">
        <img src={offer.image} alt={offer.name} className="h-72 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <button
            onClick={() => router.history.back()}
            className="grid size-9 place-items-center rounded-full bg-card/90 backdrop-blur"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex gap-2">
            <button className="grid size-9 place-items-center rounded-full bg-card/90 backdrop-blur" aria-label="Share">
              <Share2 className="size-4" />
            </button>
            <button
              onClick={() => toggle(offer.id)}
              className="grid size-9 place-items-center rounded-full bg-card/90 backdrop-blur"
              aria-label="Save"
            >
              <Heart className={`size-4 ${fav ? "fill-discount text-discount" : ""}`} />
            </button>
          </div>
        </div>
        <span className="discount-badge absolute left-4 top-16 rounded-md px-2 py-1 text-[11px]">DISCOUNT</span>
        <div className="absolute right-4 top-16 grid size-16 place-items-center rounded-full bg-discount text-discount-foreground shadow-elevated">
          <div className="text-center leading-tight">
            <div className="text-base font-extrabold">{pct}%</div>
            <div className="text-[9px] font-semibold tracking-wider">OFF</div>
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div>
          <h1 className="font-display text-xl font-extrabold">{offer.name}</h1>
          <p className="text-sm text-muted-foreground">
            {offer.restaurant} · {offer.cuisine} · {offer.distanceKm} km
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <Star className="size-3.5 fill-primary text-primary" />
            <span className="font-semibold">{offer.rating}</span>
            <span className="text-muted-foreground">(125)</span>
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-muted-foreground line-through">${offer.originalPrice.toFixed(2)}</span>
          <span className="font-display text-3xl font-extrabold text-primary">
            ${offer.discountedPrice.toFixed(2)}
          </span>
          <span className="ml-auto text-xs font-semibold text-success">You save ${saved}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Info icon={Clock} title={offer.pickupTime || "—"} sub="Pickup Time" />
          <Info icon={Users} title="1 Person" sub="Serves" />
          <Info icon={MapPin} title={`${offer.distanceKm} km away`} sub="Distance" />
          <Info icon={Clock} title={offer.validUntil} sub="Valid till" />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{offer.description}</p>

        <div className="rounded-xl bg-secondary p-3 text-secondary-foreground">
          <p className="text-xs font-bold">Hurry! Limited time offer</p>
          <p className="text-[11px] opacity-80">This offer is valid only for today.</p>
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
        <button
          onClick={order}
          disabled={placing}
          className="flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-elevated transition hover:bg-primary-glow disabled:opacity-60"
        >
          {placing ? "Placing order…" : `Order Now · $${offer.discountedPrice.toFixed(2)}`}
        </button>
        {!user && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            <Link to="/auth" className="font-semibold text-primary">Sign in</Link> to place orders.
          </p>
        )}
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 shadow-card">
      <Icon className="size-4 text-primary" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
