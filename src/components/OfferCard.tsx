import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Offer } from "@/lib/sample-data";
import { discountPct } from "@/lib/sample-data";
import { useFavorites } from "@/lib/favorites";

export function OfferCard({ offer }: { offer: Offer }) {
  const { toggle, has } = useFavorites();
  const fav = has(offer.id);
  return (
    <Link
      to="/offer/$id"
      params={{ id: offer.id }}
      className="group block rounded-2xl bg-card shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="flex gap-3 p-2.5">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
          <img
            src={offer.image}
            alt={offer.name}
            loading="lazy"
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
          <span className="discount-badge absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px]">
            DISCOUNT
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{offer.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{offer.restaurant}</p>
            {offer.pickupTime && (
              <p className="mt-0.5 truncate text-[10px] font-semibold text-primary">
                Pickup · {offer.pickupTime}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground line-through">
                ${offer.originalPrice.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-foreground">
                ${offer.discountedPrice.toFixed(2)}
              </span>
            </div>
            <span className="rounded-md bg-discount px-1.5 py-0.5 text-[10px] font-bold text-discount-foreground">
              {discountPct(offer)}% OFF
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(offer.id);
          }}
          className="self-start rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-discount"
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`size-4 ${fav ? "fill-discount text-discount" : ""}`} />
        </button>
      </div>
    </Link>
  );
}
