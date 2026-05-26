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
  status: string;
  profiles: { display_name: string } | null;
  restaurants: { name: string } | null;
  offers: { name: string } | null;
};

function AdminOverview() {
  const [tx, setTx] = useState<Tx[]>([]);
  const [counts, setCounts] = useState({ restaurants: 0, offers: 0, activeOffers: 0, transactions: 0 });
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("all");

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
            offers(name),
            status
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

  const filteredTx = tx.filter((t) => {
    if (timeFilter === "today") return now - new Date(t.created_at).getTime() <= dayMs;
    if (timeFilter === "week") return now - new Date(t.created_at).getTime() <= 7 * dayMs;
    if (timeFilter === "month") return now - new Date(t.created_at).getTime() <= 30 * dayMs;
    return true;
  });

  const filteredSales = filteredTx.reduce((acc, t) => acc + Number(t.customer_total_price || 0), 0);
  const filteredCommission = filteredTx.reduce((acc, t) => acc + Number(t.commission_amount || 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">لوحة تحكم الإدارة</h1>
          <p className="text-sm text-muted-foreground">نظرة عامة على المنصة، مدفوعات العملاء، ومتابعة عمولة التطبيق (20%).</p>
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as any)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold shadow-sm outline-none focus:border-primary"
        >
          <option value="today">اليوم</option>
          <option value="week">هذا الأسبوع</option>
          <option value="month">هذا الشهر</option>
          <option value="all">كل الوقت</option>
        </select>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat icon={Store} label="المطاعم" value={counts.restaurants.toLocaleString()} />
        <Stat icon={Package} label="إجمالي الوجبات" value={counts.offers.toLocaleString()} />
        <Stat icon={CheckCircle} label="العروض النشطة" value={counts.activeOffers.toLocaleString()} />
        <Stat icon={ShoppingCart} label="طلبات الفترة" value={filteredTx.length.toLocaleString()} />
        <Stat icon={DollarSign} label="دفع العملاء" value={`₪${filteredSales.toFixed(2)}`} />
        <Stat icon={Percent} label="أرباح Selecto" value={`₪${filteredCommission.toFixed(2)}`} highlight />
      </div>

      {/* Sales & Commission Section */}
      <section className="rounded-2xl bg-card p-5 shadow-card">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold">الإيرادات والعمولة</h2>
          <p className="text-xs text-muted-foreground">تُضاف عمولة منصة Selecto فوق أسعار المطاعم.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Bucket label="اليوم" sales={today.sales} commission={today.commission} />
          <Bucket label="هذا الأسبوع" sales={week.sales} commission={week.commission} />
          <Bucket label="هذا الشهر" sales={month.sales} commission={month.commission} />
          <Bucket label="كل الوقت" sales={total.sales} commission={total.commission} />
        </div>
      </section>

      {/* Recent Transactions Table */}
      <section className="rounded-2xl bg-card shadow-card">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-extrabold">العمليات الأخيرة</h2>
          <p className="text-xs text-muted-foreground">آخر 50 طلب مسجل على المنصة.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">التاريخ والمعرف</th>
                <th className="px-5 py-3 font-semibold">العميل</th>
                <th className="px-5 py-3 font-semibold">المطعم</th>
                <th className="px-5 py-3 font-semibold">اسم الوجبة</th>
                <th className="px-5 py-3 text-left font-semibold">دفع العميل</th>
                <th className="px-5 py-3 text-left font-semibold text-primary">Selecto (20%)</th>
                <th className="px-5 py-3 text-left font-semibold">مستحقات المطعم</th>
                <th className="px-5 py-3 text-center font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                    لم يتم تسجيل أي عمليات في هذه الفترة.
                  </td>
                </tr>
              ) : (
                filteredTx.slice(0, 50).map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3 text-xs">
                      <div className="font-bold">{new Date(t.created_at).toLocaleDateString("ar-EG")}</div>
                      <div className="text-muted-foreground truncate max-w-[100px]">{t.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-5 py-3 font-medium">{t.profiles?.display_name ?? "غير معروف"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.restaurants?.name ?? "غير معروف"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.offers?.name ?? "غير معروف"}</td>
                    <td className="px-5 py-3 text-left font-semibold">₪{Number(t.customer_total_price).toFixed(2)}</td>
                    <td className="px-5 py-3 text-left font-bold text-primary">₪{Number(t.commission_amount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-left font-medium">₪{Number(t.restaurant_payout).toFixed(2)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${
                        t.status === 'completed' ? 'bg-success/15 text-success' :
                        t.status === 'cancelled' ? 'bg-destructive/15 text-destructive' :
                        t.status === 'ready_for_pickup' ? 'bg-amber-500/15 text-amber-500' :
                        'bg-primary/15 text-primary'
                      }`}>
                        {t.status === 'completed' ? 'مكتمل' : t.status === 'cancelled' ? 'ملغي' : t.status === 'ready_for_pickup' ? 'جاهز' : t.status === 'confirmed' ? 'مؤكد' : t.status || 'غير معروف'}
                      </span>
                    </td>
                  </tr>
                ))
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
      <p className="mt-1 text-[11px] text-muted-foreground">إجمالي المبيعات: ₪{sales.toFixed(2)}</p>
    </div>
  );
}
