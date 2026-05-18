import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Selecto" },
      { name: "description", content: "Track your Selecto orders." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="phone-frame flex flex-col">
      <header className="px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-extrabold">Your Orders</h1>
        <p className="text-xs text-muted-foreground">Recent and active orders</p>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
          <ClipboardList className="size-7" />
        </div>
        <h2 className="font-display text-lg font-bold">No orders yet</h2>
        <p className="text-sm text-muted-foreground">
          Discover discounted meals nearby and place your first order.
        </p>
        <Link
          to="/offers"
          className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-card"
        >
          Browse offers
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}
