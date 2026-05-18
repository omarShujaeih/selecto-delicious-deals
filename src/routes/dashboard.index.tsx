import { createFileRoute, Link } from "@tanstack/react-router";
import { DollarSign, Percent, ShoppingBag, Store, TrendingUp } from "lucide-react";
import { restaurantOffers, restaurantStats, discountPct } from "@/lib/sample-data";

export const Route = createFileRoute("/dashboard/")({
  component: RestaurantOverview,
});

function RestaurantOverview() {
  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
            <Store className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-extrabold">Wok & Roll</h1>
            <p className="text-xs text-muted-foreground">Asian Cuisine · Open now</p>
          </div>
        </div>
        <span className="rounded-full bg-success px-3 py-1 text-[11px] font-bold text-success-foreground">
          Active
        </span>
      </header>

      <h2 className="text-sm font-bold">Today's Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Percent} label="Active Offers" value={String(restaurantStats.activeOffers)} tint="bg-secondary text-primary" />
        <Stat icon={ShoppingBag} label="Orders" value={String(restaurantStats.orders)} tint="bg-accent text-accent-foreground" />
        <Stat icon={DollarSign} label="Sales" value={`$${restaurantStats.sales.toFixed(2)}`} tint="bg-secondary text-primary" />
        <Stat icon={TrendingUp} label="Commission" value={`$${restaurantStats.commission.toFixed(2)}`} tint="bg-accent text-accent-foreground" />
      </div>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Current Offers</h2>
          <Link to="/dashboard/offers" className="text-xs font-semibold text-primary">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {restaurantOffers.slice(0, 4).map((o) => (
            <li key={o.id} className="flex items-center gap-3 py-2.5">
              <img src={o.image} alt={o.name} loading="lazy" className="size-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{o.name}</p>
                <p className="text-[11px] text-muted-foreground">Valid till {o.validUntil}</p>
              </div>
              <span className="rounded-md bg-discount px-2 py-0.5 text-[10px] font-bold text-discount-foreground">
                {discountPct(o)}% OFF
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Link to="/dashboard/offers/new" className="rounded-2xl bg-primary p-4 text-center text-sm font-bold text-primary-foreground shadow-card">
          + Add Offer
        </Link>
        <Link to="/dashboard/offers" className="rounded-2xl bg-card p-4 text-center text-sm font-semibold shadow-card">
          Orders
        </Link>
        <Link to="/dashboard/analytics" className="rounded-2xl bg-card p-4 text-center text-sm font-semibold shadow-card">
          Payouts
        </Link>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className={`mb-2 grid size-9 place-items-center rounded-lg ${tint}`}>
        <Icon className="size-4" />
      </div>
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
