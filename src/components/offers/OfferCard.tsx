import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, Heart, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites";
import { discountPct, type Offer } from "@/lib/offers-data";

export function OfferCard({ offer }: { offer: Offer }) {
  const { toggle, has } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fav = has(offer.id);
  const saved = offer.originalPrice - offer.discountedPrice;

  return (
    <Link
      to="/offer/$id"
      params={{ id: offer.id }}
      className="group grid grid-cols-[112px_1fr] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-card sm:grid-cols-[128px_1fr]"
    >
      <div className="relative min-h-[136px] overflow-hidden">
        <img
          src={offer.image}
          alt={offer.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2 right-2 rounded-full bg-discount px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
          {discountPct(offer)}%
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-2 p-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-foreground">{offer.name}</h3>
              <p className="truncate text-[11px] font-semibold text-muted-foreground">
                {offer.restaurant}
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                if (!user) {
                  toast.error("الرجاء تسجيل الدخول لحفظ المفضلة");
                  navigate({ to: "/auth" });
                  return;
                }
                toggle(offer.id);
                toast.success(fav ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة");
              }}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-discount transition active:scale-95"
              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`size-4 ${fav ? "fill-discount" : ""}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star className="size-3 fill-amber-500" />
              {offer.rating || "4.5"}
            </span>
            <span className="flex items-center gap-0.5">
              <MapPin className="size-3 text-primary" />
              {offer.distanceKm} km
            </span>
            {offer.pickupTime && (
              <span className="flex min-w-0 items-center gap-0.5 truncate text-primary">
                <Clock className="size-3 shrink-0" />
                <span className="truncate">{offer.pickupTime}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 border-t border-border/40 pt-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground line-through">
                ₪{offer.originalPrice.toFixed(0)}
              </span>
              <span className="text-base font-black text-primary">
                ₪{offer.discountedPrice.toFixed(0)}
              </span>
            </div>
            <p className="text-[10px] font-bold text-emerald-700">وفرت ₪{saved.toFixed(0)}</p>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black text-primary-foreground">
            عرض
          </span>
        </div>
      </div>
    </Link>
  );
}
