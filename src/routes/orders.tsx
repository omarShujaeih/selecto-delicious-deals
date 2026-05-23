import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerGuard } from "@/lib/auth-context";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Selecto" },
      { name: "description", content: "Track your Selecto orders." },
    ],
  }),
  component: OrdersPage,
});

const arabicCities: Record<string, string> = {
  Ramallah: "رام الله",
  Nablus: "نابلس",
  Hebron: "الخليل",
  Bethlehem: "بيت لحم",
  Jerusalem: "القدس",
  Jenin: "جنين",
  Tulkarm: "طولكرم",
  Qalqilya: "قلقيلية",
  Jericho: "أريحا",
};

type Tx = {
  id: string;
  sale_amount: number;
  commission_amount: number;
  restaurant_price: number;
  created_at: string;
  offers?: { name: string; image: string | null; pickup_time?: string | null } | null;
  restaurants?: { name: string; city?: string | null } | null;
};

function OrdersPage() {
  const { user } = useAuth();
  const [tx, setTx] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  useCustomerGuard();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from("transactions")
      .select("id, sale_amount, commission_amount, restaurant_price, created_at, offers(name, image, pickup_time), restaurants(name, city)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTx((data as any[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="phone-frame flex flex-col min-h-screen pb-20 bg-background text-foreground select-none">
      <header className="px-5 pt-6 pb-4 border-b border-border/40 text-right" dir="rtl">
        <h1 className="font-display text-2xl font-black">طلباتي</h1>
        <p className="text-xs text-muted-foreground mt-0.5">تتبع طلباتك النشطة وتاريخ حجز الوجبات</p>
      </header>
      <main className="flex flex-1 flex-col gap-3 p-5">
        {!user ? (
          <EmptyState
            title="تسجيل الدخول لعرض الطلبات"
            sub="يرجى تسجيل الدخول لتتمكن من تتبع طلباتك المحجوزة وتفاصيل استلامها."
            cta="تسجيل الدخول"
            to="/auth"
          />
        ) : loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-xs text-muted-foreground">جاري تحميل سجل طلباتك...</p>
          </div>
        ) : tx.length === 0 ? (
          <EmptyState
            title="لا توجد طلبات بعد"
            sub="اكتشف الوجبات اللذيذة المتاحة بخصومات رائعة من المطاعم القريبة منك واحجز أول طلب الآن!"
            cta="تصفح العروض اليومية"
            to="/offers"
          />
        ) : (
          <ul className="space-y-4">
            {tx.map((t) => (
              <li key={t.id} className="rounded-2xl border border-border bg-card p-4.5 shadow-sm space-y-3.5 hover:shadow-md transition-shadow" dir="rtl">
                <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                  {t.offers?.image && (
                    <img src={t.offers.image} alt="" className="size-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-sm font-black text-foreground">{t.offers?.name ?? "طلب بدون اسم"}</p>
                    <p className="text-[11px] font-bold text-muted-foreground/80 mt-0.5">
                      {t.restaurants?.name} • {t.restaurants?.city ? (arabicCities[t.restaurants.city] || t.restaurants.city) : "رام الله"}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="inline-block rounded-full bg-emerald-500/10 text-emerald-700 px-2.5 py-1 text-[10px] font-black">
                      مؤكد الاستلام
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs font-bold text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الطلب:</span>
                    <span className="text-foreground font-mono truncate max-w-[85px]" dir="ltr">#{t.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ الطلب:</span>
                    <span className="text-foreground">{new Date(t.created_at).toLocaleDateString("ar-EG")}</span>
                  </div>
                  <div className="flex justify-between col-span-2 border-b border-dashed border-border/50 pb-2">
                    <span className="text-muted-foreground">نافذة الاستلام من المطعم:</span>
                    <span className="text-primary font-black flex items-center gap-1">
                      <Clock className="size-3 shrink-0" />
                      <span>{t.offers?.pickup_time || "يحدده المطعم"}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">سعر المطعم الأساسي:</span>
                    <span className="text-foreground">₪{Number(t.restaurant_price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رسوم سيلكتو (20%):</span>
                    <span className="text-foreground">₪{Number(t.commission_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/80 pt-3 col-span-2 text-sm font-black">
                    <span className="text-primary">الإجمالي المدفوع:</span>
                    <span className="text-primary text-base">₪{Number(t.sale_amount).toFixed(2)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function EmptyState({ title, sub, cta, to }: { title: string; sub: string; cta: string; to: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center" dir="rtl">
      <div className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
        <ClipboardList className="size-7" />
      </div>
      <h2 className="font-display text-lg font-black text-foreground mt-2">{title}</h2>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">{sub}</p>
      <Link to={to} className="mt-4 rounded-xl bg-primary px-6 py-3 text-xs font-black text-primary-foreground shadow-card hover:bg-primary-glow transition-all active:scale-95">
        {cta}
      </Link>
    </div>
  );
}
