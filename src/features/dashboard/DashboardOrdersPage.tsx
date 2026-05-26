import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth.context";
import { getMyTransactions } from "@/features/dashboard/restaurant.functions";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/orders")({
  component: DashboardOrders,
});

function DashboardOrders() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleStatusUpdate = async (txId: string, newStatus: string, currentStatus: string) => {
    let cancelReason: string | undefined = undefined;

    if (newStatus === "cancelled") {
      const reason = window.prompt("الرجاء إدخال سبب الإلغاء:");
      if (!reason || reason.trim() === "") {
        return;
      }
      cancelReason = reason.trim();
    }

    setUpdatingId(txId);
    try {
      const { updateOrderStatus } = await import("@/features/dashboard/restaurant.functions");
      await updateOrderStatus({ 
        data: { 
          id: txId, 
          status: newStatus as "confirmed" | "ready_for_pickup" | "completed" | "cancelled", 
          cancellation_reason: cancelReason 
        } 
      });
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, status: newStatus, cancellation_reason: cancelReason } : t))
      );
      toast.success("تم تحديث حالة الطلب");
    } catch (err: any) {
      toast.error(err.message || "تعذر تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-20" dir="rtl">
      <h1 className="font-display text-xl font-extrabold text-foreground">الطلبات الواردة</h1>

      {loading ? (
        <p className="py-10 text-center text-xs text-muted-foreground">جاري التحميل...</p>
      ) : transactions.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
          لا توجد طلبات حتى الآن.
        </p>
      ) : (
        <div className="grid gap-4">
          {transactions.map((tx) => {
            const isUpdating = updatingId === tx.id;
            const status = tx.status || "confirmed";
            const customerNote = tx.customer_note;
            
            return (
              <article key={tx.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
                <div className="p-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      {tx.offers?.image && (
                        <img src={tx.offers.image} alt={tx.offers.name} className="size-12 shrink-0 rounded-lg object-cover" />
                      )}
                      <div>
                        <h2 className="text-sm font-bold text-foreground">
                          {tx.offers?.name || "عرض غير معروف"} 
                          <span className="text-primary opacity-80 mr-1">(x{tx.quantity || 1})</span>
                        </h2>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {format(new Date(tx.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                      status === "confirmed" ? "bg-warning/10 text-warning" :
                      status === "ready_for_pickup" ? "bg-blue-500/10 text-blue-500" :
                      status === "completed" ? "bg-success/10 text-success" :
                      status === "cancelled" ? "bg-destructive/10 text-destructive" :
                      "bg-secondary text-foreground"
                    }`}>
                      {status === "confirmed" ? "تم الحجز" :
                       status === "ready_for_pickup" ? "جاهز للاستلام" :
                       status === "completed" ? "تم الاستلام" :
                       status === "cancelled" ? "ملغي" : status}
                    </span>
                  </div>

                  {/* Details Row */}
                  <div className="mt-3 grid gap-2 text-xs font-semibold">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">إجمالي دفع الزبون:</span>
                      <span className="text-foreground">₪{(Number(tx.customer_total_price) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">حصة المطعم:</span>
                      <span className="font-bold text-primary">₪{(Number(tx.restaurant_payout) || 0).toFixed(2)}</span>
                    </div>
                    
                    {tx.fulfillment_type === "delivery" ? (
                      <div className="mt-1 flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                          🚗 طلب توصيل
                        </span>
                        <span className="text-[11px] text-muted-foreground">📍 {tx.delivery_address}</span>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-start">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-black text-foreground">
                          🛍️ استلام من الفرع
                        </span>
                      </div>
                    )}
                    
                    {customerNote && (
                      <div className="mt-2 rounded-lg bg-warning/5 p-2 text-[11px] font-bold text-warning">
                        📝 ملاحظات الزبون: {customerNote}
                      </div>
                    )}

                    {status === "cancelled" && tx.cancellation_reason && (
                      <div className="mt-1 text-[11px] font-bold text-destructive">
                        سبب الإلغاء: {tx.cancellation_reason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                {(status === "confirmed" || status === "ready_for_pickup") && (
                  <div className="flex items-center gap-2 border-t border-border bg-secondary/30 p-3">
                    {status === "confirmed" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(tx.id, "ready_for_pickup", status)}
                          disabled={isUpdating}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-3 py-2 text-xs font-black text-white active:scale-[0.98] disabled:opacity-50 transition-transform"
                        >
                          {isUpdating ? <Loader2 className="size-4 animate-spin" /> : "تجهيز الطلب"}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(tx.id, "cancelled", status)}
                          disabled={isUpdating}
                          className="flex items-center justify-center rounded-xl bg-destructive/10 px-4 py-2 text-xs font-black text-destructive active:scale-[0.98] disabled:opacity-50 transition-transform"
                        >
                          إلغاء
                        </button>
                      </>
                    )}
                    {status === "ready_for_pickup" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(tx.id, "completed", status)}
                          disabled={isUpdating}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground active:scale-[0.98] disabled:opacity-50 transition-transform"
                        >
                          {isUpdating ? <Loader2 className="size-4 animate-spin" /> : "تم الاستلام"}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(tx.id, "cancelled", status)}
                          disabled={isUpdating}
                          className="flex items-center justify-center rounded-xl bg-destructive/10 px-4 py-2 text-xs font-black text-destructive active:scale-[0.98] disabled:opacity-50 transition-transform"
                        >
                          إلغاء
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
