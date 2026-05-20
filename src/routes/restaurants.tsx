import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Search, Star, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "Restaurants in Ramallah — Selecto" },
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

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("id,name,cuisine,city,address,contact_email,active,rating, offers(count)")
        .eq("active", true)
        .order("rating", { ascending: false });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const list = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="phone-frame flex min-h-dvh flex-col">
      <header className="px-5 pb-4 pt-6">
        <h1 className="font-display text-2xl font-extrabold">Restaurants</h1>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> Ramallah
        </p>
      </header>

      <div className="px-5">
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-2.5 shadow-card">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <main className="flex-1 space-y-2 px-5 py-4">
        {loading ? (
          <p className="py-10 text-center text-xs text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            No restaurants found.
          </p>
        ) : (
          list.map((r) => {
            const count = r.offers?.[0]?.count ?? 0;
            return (
              <Link
                key={r.id}
                to="/offers"
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card transition hover:-translate-y-0.5"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
                  <Store className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.cuisine} · {r.city ?? "Ramallah"}
                  </p>
                  {(r.address || r.contact_email) && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {r.address ?? r.contact_email}
                    </p>
                  )}
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold">
                    <Star className="size-3 fill-primary text-primary" /> {r.rating}
                    <span className="ml-2 text-muted-foreground">· {count} offers</span>
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
