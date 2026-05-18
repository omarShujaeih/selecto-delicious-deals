import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Clock, Heart, MapPin, Share2, Star, Users } from "lucide-react";
import { discountPct, offerById } from "@/lib/sample-data";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/offer/$id")({
  loader: ({ params }) => {
    const offer = offerById(params.id);
    if (!offer) throw notFound();
    return offer;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Selecto` : "Offer — Selecto" },
      {
        name: "description",
        content: loaderData?.description ?? "Discounted meal offer",
      },
      ...(loaderData
        ? [
            { property: "og:title", content: `${loaderData.name} — ${discountPct(loaderData)}% OFF` },
            { property: "og:description", content: loaderData.description },
            { property: "og:image", content: loaderData.image },
          ]
        : []),
    ],
  }),
  component: OfferDetails,
  notFoundComponent: () => (
    <div className="phone-frame grid place-items-center p-8 text-center">
      <p>Offer not found.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="phone-frame grid place-items-center p-8 text-center text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
});

function OfferDetails() {
  const offer = Route.useLoaderData();
  const router = useRouter();
  const { toggle, has } = useFavorites();
  const fav = has(offer.id);
  const pct = discountPct(offer);
  const saved = (offer.originalPrice - offer.discountedPrice).toFixed(2);

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
        <span className="discount-badge absolute left-4 top-16 rounded-md px-2 py-1 text-[11px]">
          DISCOUNT
        </span>
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
          <span className="text-muted-foreground line-through">
            ${offer.originalPrice.toFixed(2)}
          </span>
          <span className="font-display text-3xl font-extrabold text-primary">
            ${offer.discountedPrice.toFixed(2)}
          </span>
          <span className="ml-auto text-xs font-semibold text-success">
            You save ${saved}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Info icon={Clock} title={offer.prepMinutes} sub="Delivery Time" />
          <Info icon={Users} title="1 Person" sub="Serves" />
          <Info icon={MapPin} title={`${offer.distanceKm} km away`} sub="Distance" />
          <Info icon={Clock} title={offer.validUntil} sub="Valid till" />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {offer.description}
        </p>

        <div className="rounded-xl bg-secondary p-3 text-secondary-foreground">
          <p className="text-xs font-bold">Hurry! Limited time offer</p>
          <p className="text-[11px] opacity-80">This offer is valid only for today.</p>
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
        <Link
          to="/orders"
          className="flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-elevated transition hover:bg-primary-glow"
        >
          Order Now · ${offer.discountedPrice.toFixed(2)}
        </Link>
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
