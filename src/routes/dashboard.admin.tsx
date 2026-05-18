import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Package, Store, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminOverview,
});

type Tx = { sale_amount: number; commission_amount: number; created_at: string };

function AdminOverview() {
  const [tx, setTx] = useState<Tx[]>([]);
  const [counts, setCounts] = useState({ users: 0, restaurants: 0, offers: 0 });

  useEffect(() => {
    (async () => {
      const [{ data: txs }, { count: rCount }, { count: oCount }, { count: uCount }] = await Promise.all([
        supabase.from("transactions").select("sale_amount, commission_amount, created_at"),
        supabase.from("restaurants").select("*", { count: "exact", head: true }),
        supabase.from("offers").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setTx((txs as Tx[]) ?? []);
      setCounts({
        users: uCount ?? 0,
        restaurants: rCount ?? 0,
        offers: oCount ?? 0,
      });
    })();
  }, []);

  const now = Date.now();
  const dayMs = 86400000;
  const sum = (filterMs: number) =>
    tx
      .filter((t) => now - new Date(t.created_at).getTime() <= filterMs)
      .reduce(
        (s, t) => ({
          sales: s.sales + Number(t.sale_amount),
          commission: s.commission + Number(t.commission_amount),
        }),
        { sales: 0, commission: 0 },
      );

  const today = sum(dayMs);
  const week = sum(7 * dayMs);
  const month = sum(30 * dayMs);
  const total = sum(Infinity);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-xl font-extrabold">Admin Dashboard</h1>
        <p className="text-xs text-muted-foreground">Platform-wide stats and commissions</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={Users} label="Users" value={counts.users.toLocaleString()} />
        <Stat icon={Store} label="Restaurants" value={counts.restaurants.toLocaleString()} />
        <Stat icon={Package} label="Offers" value={counts.offers.toLocaleString()} />
        <Stat icon={DollarSign} label="Revenue (all)" value={`$${total.sales.toFixed(2)}`} />
        <Stat icon={TrendingUp} label="Commission (all)" value={`$${total.commission.toFixed(2)}`} />
      </div>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="mb-3 text-sm font-bold">Commissions (20% platform fee)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Bucket label="Today" sales={today.sales} commission={today.commission} />
          <Bucket label="This Week" sales={week.sales} commission={week.commission} />
          <Bucket label="This Month" sales={month.sales} commission={month.commission} />
        </div>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="mb-3 text-sm font-bold">Recent Transactions</h2>
        {tx.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {tx.slice(0, 10).map((t, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-muted-foreground">{new Date(t.created_at).toLocaleString()}</span>
                <span>
                  <span className="font-semibold">${Number(t.sale_amount).toFixed(2)}</span>
                  <span className="ml-2 text-xs text-success">+${Number(t.commission_amount).toFixed(2)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="mb-2 grid size-9 place-items-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" />
      </div>
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Bucket({ label, sales, commission }: { label: string; sales: number; commission: number }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-extrabold">${commission.toFixed(2)}</p>
      <p className="text-[11px] text-muted-foreground">on ${sales.toFixed(2)} sales</p>
    </div>
  );
}
