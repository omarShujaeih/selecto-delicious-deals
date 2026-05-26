import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth.context";
import { getMyTransactions } from "@/features/dashboard/restaurant.functions";
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
    <div className="space-y-4" dir="rtl">
      <h1 className="font-display text-xl font-extrabold">سجل الطلبات</h1>

      {loading ? (
        <p className="py-10 text-center text-xs text-muted-foreground">جاري التحميل...</p>
      ) : transactions.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
          لا توجد طلبات حتى الآن.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">التاريخ</th>
                  <th className="px-4 py-3 font-semibold">الوجبة</th>
                  <th className="px-4 py-3 font-semibold">دفع الزبون</th>
                  <th className="px-4 py-3 font-semibold text-primary">حصتك</th>
                  <th className="px-4 py-3 font-semibold">حالة الطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {format(new Date(tx.created_at), "MMM d, yyyy h:mm a")}
                    </td>
                      <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {tx.offers?.image && (
                            <img src={tx.offers.image} alt={tx.offers.name} className="size-8 rounded-md object-cover" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold">{tx.offers?.name || "عرض غير معروف"} <span className="text-primary opacity-80">(x{tx.quantity || 1})</span></span>
                            {tx.customer_note && (
                              <span className="mt-0.5 text-xs font-medium text-warning opacity-90">📝 {tx.customer_note}</span>
                            )}
                          </div>
                        </div>
                        {tx.fulfillment_type === "delivery" ? (
                          <div className="mt-1 flex flex-col text-xs">
                            <span className="font-bold text-primary">🚗 توصيل</span>
                            <span className="text-muted-foreground">{tx.delivery_address}</span>
                          </div>
                        ) : (
                          <div className="mt-1 text-xs font-bold text-muted-foreground">
                            🛍️ استلام من المطعم
                          </div>
                        )}
                        {tx.status === "cancelled" && tx.cancellation_reason && (
                          <div className="mt-1 text-xs font-bold text-destructive">
                            سبب الإلغاء: {tx.cancellation_reason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      ₪{(Number(tx.customer_total_price) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      ₪{(Number(tx.restaurant_payout) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={tx.status || "confirmed"}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          let cancelReason = undefined;
                          if (newStatus === "cancelled") {
                            const reason = window.prompt("الرجاء إدخال سبب الإلغاء:");
                            if (!reason) {
                              e.target.value = tx.status || "confirmed";
                              return;
                            }
                            cancelReason = reason;
                          }
                          try {
                            const { updateOrderStatus } = await import("@/features/dashboard/restaurant.functions");
                            await updateOrderStatus({ data: { id: tx.id, status: newStatus, cancellation_reason: cancelReason } });
                            setTransactions((prev) =>
                              prev.map((t) => (t.id === tx.id ? { ...t, status: newStatus, cancellation_reason: cancelReason } : t))
                            );
                            toast.success("تم تحديث حالة الطلب");
                          } catch (err: any) {
                            toast.error(err.message || "تعذر تحديث الحالة");
                            e.target.value = tx.status || "confirmed";
                          }
                        }}
                        className={`rounded-md px-2 py-1 text-xs font-bold outline-none focus:ring-2 focus:ring-ring ${
                          tx.status === "confirmed" ? "bg-warning/10 text-warning" :
                          tx.status === "completed" ? "bg-success/10 text-success" :
                          tx.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                          "bg-secondary text-foreground"
                        }`}
                      >
                        <option value="confirmed">بانتظار الموافقة</option>
                        <option value="completed">تم القبول</option>
                        <option value="cancelled">ملغي</option>
                      </select>
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
