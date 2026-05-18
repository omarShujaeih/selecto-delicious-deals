import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SelectoLogo } from "@/components/SelectoLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Selecto — Great meals. Lower prices." },
      {
        name: "description",
        content:
          "Discover discounted meals from top local restaurants. Save more, eat better with Selecto.",
      },
      { property: "og:title", content: "Selecto — Great meals. Lower prices." },
      {
        property: "og:description",
        content: "Discover discounted meals from top local restaurants.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="phone-frame flex flex-col">
      {show ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <SelectoLogo size={120} />
          <div>
            <h1 className="font-display text-4xl font-extrabold text-primary">Selecto</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Great Meals. Lower Prices.
            </p>
          </div>
          <p className="mt-12 text-xs text-muted-foreground">
            Delicious meals at discounts you'll love.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
          <SelectoLogo size={96} />
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-extrabold">Welcome to Selecto</h1>
            <p className="text-sm text-muted-foreground">
              Browse offers as a guest, or sign in to save favorites.
            </p>
          </div>
          <div className="mt-4 flex w-full max-w-xs flex-col gap-3">
            <Link
              to="/offers"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary-glow"
            >
              Explore offers
            </Link>
            <Link
              to="/dashboard"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              I'm a restaurant or admin
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
