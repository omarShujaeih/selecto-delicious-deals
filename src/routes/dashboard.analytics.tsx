import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyRestaurantStats } from "@/lib/restaurant.functions";
import { toast } from "sonner";
import { salesTrend } from "@/lib/sample-data";

export const Route = createFileRoute("/dashboard/analytics")({
  component: Analytics,
});

function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await getMyRestaurantStats();
        setStats(res);
      } catch (err: any) {
        toast.error(err.message || "Failed to load stats");
      }
    })();
  }, [user]);

  const max = Math.max(...salesTrend.map((p) => p.sales));
  const w = 320;
  const h = 140;
  const points = salesTrend
    .map((p, i) => {
      const x = (i / (salesTrend.length - 1)) * w;
      const y = h - (p.sales / max) * (h - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-extrabold">Analytics</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Customer Payments" value={`₪${(stats?.totalCustomerPayments || 0).toFixed(2)}`} />
        <Metric label="Orders" value={String(stats?.totalOrders || 0)} />
        <Metric label="Your Payouts" value={`₪${(stats?.totalPayouts || 0).toFixed(2)}`} />
        <Metric label="Selecto Commission" value={`₪${(stats?.totalCommissions || 0).toFixed(2)}`} />
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Sales Trend (Sample Data)</h2>
          <span className="text-xs text-muted-foreground">This week</span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Sales trend chart">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="url(#g)"
            stroke="none"
            points={`0,${h} ${points} ${w},${h}`}
          />
          <polyline
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {salesTrend.map((p) => (
            <span key={p.day}>{p.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
      {delta && <p className="text-[11px] font-semibold text-success">{delta}</p>}
    </div>
  );
}
