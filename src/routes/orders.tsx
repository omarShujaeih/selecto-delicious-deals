import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
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

type Tx = {
  id: string;
  sale_amount: number;
  commission_amount: number;
  created_at: string;
  offers?: { name: string; image: string | null } | null;
  restaurants?: { name: string } | null;
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
      .select("id, sale_amount, commission_amount, created_at, offers(name, image), restaurants(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTx((data as Tx[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="phone-frame flex flex-col min-h-screen pb-20">
      <header className="px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-extrabold">Your Orders</h1>
        <p className="text-xs text-muted-foreground">Recent and active orders</p>
      </header>
      <main className="flex flex-1 flex-col gap-3 px-4">
        {!user ? (
          <EmptyState
            title="Sign in to view orders"
            sub="Create an account or sign in to track your orders."
            cta="Sign in"
            to="/auth"
          />
        ) : loading ? (
          <p className="py-10 text-center text-xs text-muted-foreground">Loading…</p>
        ) : tx.length === 0 ? (
          <EmptyState
            title="No orders yet"
            sub="Discover discounted meals nearby and place your first order."
            cta="Browse offers"
            to="/offers"
          />
        ) : (
          <ul className="space-y-3">
            {tx.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                {t.offers?.image && (
                  <img src={t.offers.image} alt="" className="size-14 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.offers?.name ?? "Order"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.restaurants?.name} · {new Date(t.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-bold">₪{Number(t.sale_amount).toFixed(2)}</span>
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
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
        <ClipboardList className="size-7" />
      </div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground">{sub}</p>
      <Link to={to} className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-card">
        {cta}
      </Link>
    </div>
  );
}
