import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { DollarSign, Percent, ShoppingBag, Store, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyRestaurantStats } from "@/lib/restaurant.functions";
import { toast } from "sonner";
import { fetchMyRestaurant } from "@/lib/offers-data";

export const Route = createFileRoute("/dashboard/")({
  component: RestaurantOverview,
});

function RestaurantOverview() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const r = await fetchMyRestaurant(user.id);
        setRestaurant(r);
        if (r) {
          const res = await getMyRestaurantStats();
          setStats(res);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load stats");
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
        <Stat icon={Percent} label="Active Offers" value={String(stats?.activeOffers || 0)} tint="bg-secondary text-primary" />
        <Stat icon={ShoppingBag} label="Orders" value={String(stats?.totalOrders || 0)} tint="bg-accent text-accent-foreground" />
        <Stat icon={DollarSign} label="Restaurant Payouts" value={`₪${(stats?.totalPayouts || 0).toFixed(2)}`} tint="bg-secondary text-primary" />
        <Stat icon={TrendingUp} label="Selecto Commission" value={`₪${(stats?.totalCommissions || 0).toFixed(2)}`} tint="bg-accent text-accent-foreground" />
      </div>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Recent Transactions</h2>
          <Link to="/dashboard/orders" className="text-xs font-semibold text-primary">View all orders</Link>
        </div>
        {!stats || stats.recentTransactions.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No transactions yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.recentTransactions.map((tx: any) => (
              <li key={tx.created_at} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold">₪{Number(tx.customer_total_price || 0).toFixed(2)} Paid</p>
                  <p className="text-[11px] text-muted-foreground">Payout: ₪{Number(tx.restaurant_payout || 0).toFixed(2)}</p>
                </div>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold">
                  {tx.status || "Pending"}
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
