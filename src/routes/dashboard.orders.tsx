import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyTransactions } from "@/lib/restaurant.functions";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard/orders")({
  component: DashboardOrders,
});

function DashboardOrders() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const txs = await getMyTransactions();
        setTransactions(txs);
      } catch (err: any) {
        toast.error(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-extrabold">Order History</h1>

      {loading ? (
        <p className="py-10 text-center text-xs text-muted-foreground">Loading…</p>
      ) : transactions.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Customer Paid</th>
                  <th className="px-4 py-3 font-semibold text-primary">Your Payout</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {format(new Date(tx.created_at), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {tx.offers?.image && (
                          <img src={tx.offers.image} alt={tx.offers.name} className="size-8 rounded-md object-cover" />
                        )}
                        <span className="font-semibold">{tx.offers?.name || "Unknown Offer"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      ₪{(Number(tx.customer_total_price) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      ₪{(Number(tx.restaurant_payout) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold">
                        {tx.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
