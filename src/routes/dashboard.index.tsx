import { createFileRoute, Link } from "@tanstack/react-router";
import { DollarSign, Percent, ShoppingBag, Store, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyOffers, fetchMyRestaurant } from "@/lib/offers-data";
import { discountPct } from "@/lib/sample-data";
import type { Offer } from "@/lib/sample-data";

export const Route = createFileRoute("/dashboard/")({
  component: RestaurantOverview,
});

function RestaurantOverview() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState({ orders: 0, sales: 0, commission: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const r = await fetchMyRestaurant(user.id);
      setRestaurant(r);
      if (r) {
        const list = await fetchMyOffers(r.id);
        setOffers(list);
        const { data } = await supabase
          .from("transactions")
          .select("sale_amount, commission_amount")
          .eq("restaurant_id", r.id);
        const rows = (data ?? []) as { sale_amount: number; commission_amount: number }[];
        setStats({
          orders: rows.length,
          sales: rows.reduce((s, t) => s + Number(t.sale_amount), 0),
          commission: rows.reduce((s, t) => s + Number(t.commission_amount), 0),
        });
      }
    })();
  }, [user]);

  if (!restaurant) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-card">
        <h1 className="font-display text-lg font-extrabold">No restaurant yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn't have a restaurant profile. Contact support or sign up again selecting Restaurant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
            <Store className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-extrabold">{restaurant.name}</h1>
            <p className="text-xs text-muted-foreground">{restaurant.cuisine} · {restaurant.active ? "Open now" : "Closed"}</p>
          </div>
        </div>
        <span className="rounded-full bg-success px-3 py-1 text-[11px] font-bold text-success-foreground">
          {restaurant.active ? "Active" : "Inactive"}
        </span>
      </header>

      <h2 className="text-sm font-bold">Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Percent} label="Active Offers" value={String(offers.filter((o: any) => o.active !== false).length)} tint="bg-secondary text-primary" />
        <Stat icon={ShoppingBag} label="Orders" value={String(stats.orders)} tint="bg-accent text-accent-foreground" />
        <Stat icon={DollarSign} label="Sales" value={`$${stats.sales.toFixed(2)}`} tint="bg-secondary text-primary" />
        <Stat icon={TrendingUp} label="Commission" value={`$${stats.commission.toFixed(2)}`} tint="bg-accent text-accent-foreground" />
      </div>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Current Offers</h2>
          <Link to="/dashboard/offers" className="text-xs font-semibold text-primary">View all</Link>
        </div>
        {offers.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No offers yet. <Link to="/dashboard/offers/new" className="font-semibold text-primary">Add your first offer</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {offers.slice(0, 4).map((o) => (
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
        )}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Link to="/dashboard/offers/new" className="rounded-2xl bg-primary p-4 text-center text-sm font-bold text-primary-foreground shadow-card">
          + Add Offer
        </Link>
        <Link to="/dashboard/offers" className="rounded-2xl bg-card p-4 text-center text-sm font-semibold shadow-card">
          Offers
        </Link>
        <Link to="/dashboard/analytics" className="rounded-2xl bg-card p-4 text-center text-sm font-semibold shadow-card">
          Analytics
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
