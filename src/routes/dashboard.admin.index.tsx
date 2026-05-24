import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, DollarSign, Package, Percent, ShoppingCart, Store, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import React from "react";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-red-500 font-mono text-xs whitespace-pre-wrap">CRASH: {this.state.error?.message}{'\n'}{this.state.error?.stack}</div>;
    }
    return this.props.children;
  }
}

export const Route = createFileRoute("/dashboard/admin/")({
  component: () => <ErrorBoundary><AdminOverview /></ErrorBoundary>,
});

type Tx = {
  id: string;
  customer_total_price: number;
  commission_amount: number;
  restaurant_payout: number;
  created_at: string;
  profiles: { display_name: string } | null;
  restaurants: { name: string } | null;
  offers: { name: string } | null;
};

function AdminOverview() {
  const [tx, setTx] = useState<Tx[]>([]);
  const [counts, setCounts] = useState({ restaurants: 0, offers: 0, activeOffers: 0, transactions: 0 });

  useEffect(() => {
    (async () => {
      try {
        console.log("[AdminDashboard] Fetching data...");
        // Fetch exact counts
        const restCount = await supabase.from("restaurants").select("*", { count: "exact", head: true });
        if (restCount.error) throw new Error("Restaurants fetch failed: " + restCount.error.message);

        const offerCount = await supabase.from("offers").select("*", { count: "exact", head: true });
        if (offerCount.error) throw new Error("Offers fetch failed: " + offerCount.error.message);

        const activeOfferCount = await supabase.from("offers").select("*", { count: "exact", head: true }).eq("active", true);
        const txCount = await supabase.from("transactions").select("*", { count: "exact", head: true });

        setCounts({
          restaurants: restCount.count ?? 0,
          offers: offerCount.count ?? 0,
          activeOffers: activeOfferCount.count ?? 0,
          transactions: txCount.count ?? 0,
        });

        const allTxRes = await supabase
          .from("transactions")
          .select(`
            id,
            customer_total_price,
            commission_amount,
            restaurant_payout,
            created_at,
            profiles(display_name),
            restaurants(name),
            offers(name)
          `)
          .order("created_at", { ascending: false });

        if (allTxRes.error) throw new Error("Transactions fetch failed: " + allTxRes.error.message);

        if (allTxRes.data) {
          setTx(allTxRes.data as unknown as Tx[]);
        }
        console.log("[AdminDashboard] Data fetch complete!");
      } catch (err: any) {
        console.error("[AdminDashboard] Data fetch error:", err);
        alert("حدث خطأ أثناء جلب بيانات لوحة التحكم: " + err.message);
      }
    })();
  }, []);

  const now = Date.now();
  const dayMs = 86400000;
  const sum = (filterMs: number) =>
    tx
      .filter((t) => now - new Date(t.created_at).getTime() <= filterMs)
      .reduce(
        (s, t) => ({
          sales: s.sales + Number(t.customer_total_price || 0),
          commission: s.commission + Number(t.commission_amount || 0),
        }),
        { sales: 0, commission: 0 },
      );

  const today = sum(dayMs);
  const week = sum(7 * dayMs);
  const month = sum(30 * dayMs);
  const total = sum(Infinity);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview, customer payments, and 20% commission tracking.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat icon={Store} label="Restaurants" value={counts.restaurants.toLocaleString()} />
        <Stat icon={Package} label="Total Items" value={counts.offers.toLocaleString()} />
        <Stat icon={CheckCircle} label="Active Offers" value={counts.activeOffers.toLocaleString()} />
        <Stat icon={ShoppingCart} label="Total Orders" value={counts.transactions.toLocaleString()} />
        <Stat icon={DollarSign} label="Customer Spent" value={`₪${total.sales.toFixed(2)}`} />
        <Stat icon={Percent} label="Platform Profit" value={`₪${total.commission.toFixed(2)}`} highlight />
      </div>

      {/* Sales & Commission Section */}
      <section className="rounded-2xl bg-card p-5 shadow-card">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold">Revenue & Commission</h2>
          <p className="text-xs text-muted-foreground">Admin platform commission is added on top of restaurant prices.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Bucket label="Today" sales={today.sales} commission={today.commission} />
          <Bucket label="This Week" sales={week.sales} commission={week.commission} />
          <Bucket label="This Month" sales={month.sales} commission={month.commission} />
          <Bucket label="All-Time" sales={total.sales} commission={total.commission} />
        </div>
      </section>

      {/* Recent Transactions Table */}
      <section className="rounded-2xl bg-card shadow-card">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-extrabold">Recent Transactions</h2>
          <p className="text-xs text-muted-foreground">Last 50 recorded platform orders.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Date & ID</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Restaurant</th>
                <th className="px-5 py-3 font-semibold">Meal Name</th>
                <th className="px-5 py-3 text-right font-semibold">Customer Paid</th>
                <th className="px-5 py-3 text-right font-semibold text-primary">Admin (20%)</th>
                <th className="px-5 py-3 text-right font-semibold">Rest. Payout</th>
                <th className="px-5 py-3 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tx.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                tx.slice(0, 50).map((t) => {
                  const sale = Number(t.customer_total_price || 0);
                  const comm = Number(t.commission_amount || 0);
                  const net = Number(t.restaurant_payout || 0);
                  return (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <p className="font-medium">{new Date(t.created_at).toLocaleDateString()}</p>
                        <p className="text-[10px] text-muted-foreground" title={t.id}>{t.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-5 py-3 font-medium">{t.profiles?.display_name ?? "Unknown"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{t.restaurants?.name ?? "Unknown"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{t.offers?.name ?? "Unknown"}</td>
                      <td className="px-5 py-3 text-right font-semibold">₪{sale.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-bold text-primary">₪{comm.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-medium">₪{net.toFixed(2)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 shadow-card ${highlight ? "bg-primary text-primary-foreground" : "bg-card"}`}>
      <div className={`mb-3 grid size-10 place-items-center rounded-xl ${highlight ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-primary"}`}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className={`text-xs font-medium ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</p>
    </div>
  );
}

function Bucket({ label, sales, commission }: { label: string; sales: number; commission: number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xl font-black text-primary">₪{commission.toFixed(2)}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">Gross Sales: ₪{sales.toFixed(2)}</p>
    </div>
  );
}
