import { createFileRoute, Link } from "@tanstack/react-router";
import { DollarSign, Percent, ShoppingBag, Store, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth.context";
import { getMyRestaurantStats } from "@/features/dashboard/restaurant.functions";
import { fetchMyRestaurant } from "@/features/offers/offers.service";

export const Route = createFileRoute("/dashboard/")({
  component: RestaurantOverview,
});

type RestaurantStats = {
  activeOffers: number;
  totalOrders: number;
  totalPayouts: number;
  totalCommissions: number;
  recentTransactions: Array<{
    created_at: string;
    customer_total_price?: number | string | null;
    restaurant_payout?: number | string | null;
    status?: string | null;
  }>;
};

function RestaurantOverview() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;

    setLoading(true);
    setRestaurant(null);
    setStats(null);

    (async () => {
      try {
        const [restaurantResult, statsResult] = await Promise.allSettled([
          fetchMyRestaurant(user.id),
          getMyRestaurantStats(),
        ]);

        if (!active) return;

        if (restaurantResult.status === "fulfilled") {
          setRestaurant(restaurantResult.value);
        } else {
          throw restaurantResult.reason;
        }

        if (statsResult.status === "fulfilled") {
          setStats(statsResult.value as RestaurantStats);
        } else {
          throw statsResult.reason;
        }
      } catch (err: any) {
        if (!active) return;
        toast.error(err?.message || "Failed to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!restaurant) {
    return (
      <div className="rounded-2xl bg-card p-6 shadow-card" dir="rtl">
        <h1 className="font-display text-lg font-extrabold">لا يوجد مطعم بعد</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حسابك لا يحتوي على ملف تعريفي للمطعم. تواصل مع الدعم أو سجل مرة أخرى واختر مطعم.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      <header className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
            <Store className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-extrabold">{restaurant.name}</h1>
            <p className="text-xs text-muted-foreground">
              {restaurant.cuisine} · {restaurant.active ? "مفتوح الآن" : "مغلق"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-success px-3 py-1 text-[11px] font-bold text-success-foreground">
          {restaurant.active ? "نشط" : "غير نشط"}
        </span>
      </header>

      <h2 className="text-sm font-bold">نظرة عامة</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Percent} label="عروض نشطة" value={String(stats?.activeOffers ?? 0)} tint="bg-secondary text-primary" />
        <Stat icon={ShoppingBag} label="الطلبات" value={String(stats?.totalOrders ?? 0)} tint="bg-accent text-accent-foreground" />
        <Stat
          icon={DollarSign}
          label="مستحقات المطعم"
          value={`₪${(stats?.totalPayouts ?? 0).toFixed(2)}`}
          tint="bg-secondary text-primary"
        />
        <Stat
          icon={TrendingUp}
          label="عمولة سيليكتو"
          value={`₪${(stats?.totalCommissions ?? 0).toFixed(2)}`}
          tint="bg-accent text-accent-foreground"
        />
      </div>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">المعاملات الأخيرة</h2>
          <Link to="/dashboard/orders" className="text-xs font-semibold text-primary">
            عرض كل الطلبات
          </Link>
        </div>
        {!stats || stats.recentTransactions.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">لا توجد معاملات بعد.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.recentTransactions.map((tx) => (
              <li key={tx.created_at} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold">₪{Number(tx.customer_total_price || 0).toFixed(2)} مدفوع</p>
                  <p className="text-[11px] text-muted-foreground">
                    المستحق: ₪{Number(tx.restaurant_payout || 0).toFixed(2)}
                  </p>
                </div>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold">
                  {tx.status || "قيد الانتظار"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Link to="/dashboard/offers/new" className="rounded-2xl bg-primary p-4 text-center text-sm font-bold text-primary-foreground shadow-card">
          + إضافة عرض
        </Link>
        <Link to="/dashboard/offers" className="rounded-2xl bg-card p-4 text-center text-sm font-semibold shadow-card">
          العروض
        </Link>
        <Link to="/dashboard/analytics" className="rounded-2xl bg-card p-4 text-center text-sm font-semibold shadow-card">
          التحليلات
        </Link>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" dir="rtl" aria-label="جاري تحميل لوحة المطعم">
      <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="size-12 animate-pulse rounded-xl bg-secondary" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded-full bg-secondary" />
            <div className="h-3 w-44 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
        <div className="h-7 w-16 animate-pulse rounded-full bg-secondary" />
      </div>

      <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-card p-3 shadow-card">
            <div className="mb-4 size-9 animate-pulse rounded-lg bg-secondary" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-secondary" />
            <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded-full bg-secondary" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between border-t border-border pt-3 first:border-t-0 first:pt-0">
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded-full bg-secondary" />
                <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-md bg-secondary" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-2xl bg-card shadow-card" />
        ))}
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
