import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, Heart, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth.context";
import { useFavorites } from "@/features/customer/favorites.service";
import { discountPct, formatILS, type Offer } from "@/features/offers/offers.service";

const cityLabels: Record<string, string> = {
  Ramallah: "رام الله",
  Nablus: "نابلس",
  Hebron: "الخليل",
  Bethlehem: "بيت لحم",
  Jerusalem: "القدس",
  Jenin: "جنين",
  Tulkarm: "طولكرم",
  Qalqilya: "قلقيلية",
  Jericho: "أريحا",
};

export function OfferCard({ offer }: { offer: Offer }) {
  const { toggle, has } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fav = has(offer.id);
  const availableQuantity = offer.availableQuantity ?? 10;
  const location = offer.city ? cityLabels[offer.city] || offer.city : `${offer.distanceKm} كم`;

  return (
    <Link
      to="/offer/$id"
      params={{ id: offer.id }}
      className="group grid grid-cols-[112px_1fr] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition active:scale-[0.99] sm:grid-cols-[132px_1fr]"
      dir="rtl"
    >
      <div className="relative min-h-36 overflow-hidden">
        <img
          src={offer.image}
          alt={offer.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 rounded-full bg-discount px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
          {discountPct(offer)}%
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-2 p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-foreground">{offer.name}</h3>
              <p className="mt-0.5 truncate text-[11px] font-bold text-muted-foreground">{offer.restaurant}</p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                if (!user) {
                  toast.info("سجل دخولك لحفظ العروض المفضلة.");
                  navigate({ to: "/auth" });
                  return;
                }
                toggle(offer.id);
                toast.success(fav ? "تمت الإزالة من المفضلة" : "تم الحفظ في المفضلة");
              }}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-discount"
              aria-label={fav ? "إزالة من المفضلة" : "حفظ في المفضلة"}
            >
              <Heart className={`size-4 ${fav ? "fill-discount" : ""}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="size-3 fill-amber-500" />
              {offer.rating || "4.5"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3 text-primary" />
              {location}
            </span>
            {offer.pickupTime && (
              <span className="flex min-w-0 items-center gap-1 text-primary">
                <Clock className="size-3 shrink-0" />
                <span className="truncate">{offer.pickupTime}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-border/50 pt-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-bold text-muted-foreground line-through">
                {formatILS(offer.originalPrice)}
              </span>
              <span className="font-display text-lg font-black text-primary">
                {formatILS(offer.discountedPrice)}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] font-black text-muted-foreground">{availableQuantity} وجبات متاحة</p>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black text-primary-foreground">
            احجز
          </span>
        </div>
      </div>
    </Link>
  );
}
