import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Search, Star, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/shared/layout/BottomNav";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "Restaurants in Ramallah - Selecto" },
      { name: "description", content: "Browse all Selecto partner restaurants in Ramallah." },
    ],
  }),
  component: RestaurantsPage,
});

type Row = {
  id: string;
  name: string;
  cuisine: string;
  city: string | null;
  address: string | null;
  contact_email: string | null;
  active: boolean;
  rating: number;
  offers: { count: number }[];
};

function RestaurantsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data, error: dbError } = await supabase
          .from("restaurants")
          .select("id,name,cuisine,city,address,contact_email,active,rating, offers(count)")
          .eq("active", true)
          .order("rating", { ascending: false });

        if (dbError) throw dbError;
        if (!active) return;
        setRows((data ?? []) as Row[]);
        setError(null);
      } catch (err: any) {
        if (!active) return;
        setRows([]);
        setError(err?.message ?? "تعذر تحميل المطاعم.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const list = rows.filter((restaurant) => restaurant.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="phone-frame flex min-h-dvh flex-col">
      <header className="px-5 pb-4 safe-top" dir="rtl">
        <h1 className="font-display text-2xl font-extrabold">المطاعم</h1>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> رام الله
        </p>
      </header>

      <div className="px-5" dir="rtl">
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-2.5 shadow-card">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن مطعم..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <main className="flex-1 space-y-2 px-5 py-4" dir="rtl">
        {loading ? (
          <RestaurantSkeletonList />
        ) : list.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            {error ?? "لا توجد مطاعم مطابقة."}
          </p>
        ) : (
          list.map((restaurant) => {
            const count = restaurant.offers?.[0]?.count ?? 0;

            return (
              <Link
                key={restaurant.id}
                to="/restaurants/$id"
                params={{ id: restaurant.id }}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card transition hover:-translate-y-0.5"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
                  <Store className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{restaurant.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {restaurant.cuisine} · {restaurant.city ?? "رام الله"}
                  </p>
                  {(restaurant.address || restaurant.contact_email) && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {restaurant.address ?? restaurant.contact_email}
                    </p>
                  )}
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold">
                    <Star className="size-3 fill-primary text-primary" /> {restaurant.rating}
                    <span className="me-2 text-muted-foreground">· {count} عروض</span>
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function RestaurantSkeletonList() {
  return (
    <div className="space-y-2" aria-label="جاري تحميل المطاعم">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
          <span className="size-12 shrink-0 animate-pulse rounded-xl bg-secondary" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
