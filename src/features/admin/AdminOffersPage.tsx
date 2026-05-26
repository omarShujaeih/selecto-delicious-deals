import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Edit, Search, Store, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminDeleteOffer, adminToggleOfferStatus } from "@/features/admin/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/admin/offers")({
  component: AdminManageOffers,
});

type OfferRow = {
  id: string;
  name: string;
  category: string;
  original_price: number;
  discounted_price: number;
  pickup_time: string | null;
  active: boolean;
  restaurant_name: string;
};

function AdminManageOffers() {
  const toggleStatus = useServerFn(adminToggleOfferStatus);
  const deleteOffer = useServerFn(adminDeleteOffer);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<OfferRow[]>([]);

  async function load() {
    const { data } = await supabase
      .from("offers")
      .select(
        `
        id, name, category, original_price, discounted_price, pickup_time, active,
        restaurants (name)
      `,
      )
      .order("created_at", { ascending: false });

    if (data) {
      setRows(
        data.map((offer: any) => ({
          id: offer.id,
          name: offer.name,
          category: offer.category,
          original_price: offer.original_price,
          discounted_price: offer.discounted_price,
          pickup_time: offer.pickup_time,
          active: offer.active,
          restaurant_name: offer.restaurants?.name ?? "Unknown",
        })),
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      await toggleStatus({ data: { id, active: !currentStatus } });
      toast.success(!currentStatus ? "Offer activated." : "Offer deactivated.");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this offer permanently?")) return;
    try {
      await deleteOffer({ data: { id } });
      toast.success("Offer deleted.");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete offer");
    }
  }

  const list = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(q.toLowerCase()) ||
      row.restaurant_name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6" dir="rtl">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-foreground">Manage Offers</h1>
        <p className="text-sm text-muted-foreground">Review and manage offers across all restaurants.</p>
      </header>

      <div className="flex items-center gap-3 rounded-full bg-card px-4 py-3 shadow-sm border border-border">
        <Search className="size-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by offer or restaurant..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="hidden md:block rounded-2xl bg-card shadow-card overflow-hidden border border-border">
        <table className="w-full text-right text-sm">
          <thead className="bg-secondary/50 text-xs text-muted-foreground border-b border-border">
            <tr>
              <th className="px-5 py-4 font-semibold">Meal Name</th>
              <th className="px-5 py-4 font-semibold">Restaurant</th>
              <th className="px-5 py-4 text-left font-semibold">Pricing</th>
              <th className="px-5 py-4 text-center font-semibold">Pickup Time</th>
              <th className="px-5 py-4 text-center font-semibold">Status</th>
              <th className="px-5 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((row) => {
              const customerPrice = row.discounted_price * 1.2;
              const pct =
                row.original_price > 0 ? Math.round(((row.original_price - customerPrice) / row.original_price) * 100) : 0;

              return (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-5 py-4">
                    <p className="font-bold text-foreground">{row.name}</p>
                    <p className="text-[11px] text-muted-foreground">{row.category}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <Store className="size-3.5" />
                      {row.restaurant_name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-left">
                    <p className="font-bold text-primary">{customerPrice.toFixed(2)}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground">Payout: {row.discounted_price.toFixed(2)}</p>
                    <div className="flex items-center justify-end gap-1.5 text-[10px]">
                      <span className="line-through text-muted-foreground">{row.original_price.toFixed(2)}</span>
                      <span className="bg-primary/10 text-primary px-1 rounded font-bold">-{pct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center text-xs font-medium">{row.pickup_time || "N/A"}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(row.id, row.active)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors hover:brightness-110 ${
                        row.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {row.active ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                      {row.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to="/dashboard/offers/edit/$id"
                        params={{ id: row.id }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No menu items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden space-y-3">
        {list.map((row) => {
          const customerPrice = row.discounted_price * 1.2;

          return (
            <li key={row.id} className="rounded-2xl bg-card p-4 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{row.name}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Store className="size-3" /> {row.restaurant_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard/offers/edit/$id"
                    params={{ id: row.id }}
                    className="grid size-8 place-items-center rounded-full bg-secondary text-primary"
                  >
                    <Edit className="size-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                <div className="text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">Price</p>
                  <p className="font-bold text-primary">{customerPrice.toFixed(2)}</p>
                </div>
                <div className="text-center border-l border-border">
                  <p className="text-[10px] uppercase text-muted-foreground">Pickup</p>
                  <p className="font-bold text-[11px] mt-1 truncate">{row.pickup_time || "N/A"}</p>
                </div>
                <div className="text-center border-l border-border">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Status</p>
                  <button
                    onClick={() => handleToggleStatus(row.id, row.active)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      row.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {row.active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {list.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">No menu items found.</li>}
      </ul>
    </div>
  );
}
