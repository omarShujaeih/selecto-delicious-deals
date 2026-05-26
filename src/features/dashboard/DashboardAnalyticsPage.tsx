import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth.context";
import { getMyRestaurantStats } from "@/features/dashboard/restaurant.functions";
import { toast } from "sonner";

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

  const salesTrend = stats?.salesTrend ?? [];
  const max = Math.max(1, ...salesTrend.map((p: any) => Number(p.sales) || 0));
  const w = 320;
  const h = 140;
  const points = salesTrend
    .map((p: any, i: number) => {
      const x = salesTrend.length > 1 ? (i / (salesTrend.length - 1)) * w : w / 2;
      const y = h - ((Number(p.sales) || 0) / max) * (h - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-5" dir="rtl">
      <h1 className="font-display text-xl font-extrabold">التحليلات</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="مدفوعات العملاء" value={`₪${(stats?.totalCustomerPayments || 0).toFixed(2)}`} />
        <Metric label="الطلبات" value={String(stats?.totalOrders || 0)} />
        <Metric label="مستحقاتك" value={`₪${(stats?.totalPayouts || 0).toFixed(2)}`} />
        <Metric label="عمولة سيليكتو" value={`₪${(stats?.totalCommissions || 0).toFixed(2)}`} />
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">مؤشر المبيعات</h2>
          <span className="text-xs text-muted-foreground">هذا الأسبوع</span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Sales trend chart">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {points && (
            <>
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
            </>
          )}
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {salesTrend.map((p: any) => (
            <span key={p.day}>{new Date(p.day).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
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
