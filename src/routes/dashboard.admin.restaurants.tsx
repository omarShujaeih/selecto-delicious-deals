import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Search, Store, MoreVertical, CheckCircle2, XCircle, Phone } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminCreateRestaurant, adminToggleRestaurantStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/dashboard/admin/restaurants")({
  component: ManageRestaurants,
});

type Row = {
  id: string;
  name: string;
  cuisine: string;
  city: string | null;
  phone_number: string | null;
  contact_email: string | null;
  active: boolean;
  itemCount: number;
  totalSales: number;
};

const RAMALLAH_AREAS = [
  "Al-Manara",
  "Al-Tireh",
  "Al-Bireh",
  "Al-Masyoun",
  "Rukab Street",
  "Al-Irsal",
  "Downtown Ramallah",
  "Ein Misbah",
];

function ManageRestaurants() {
  const create = useServerFn(adminCreateRestaurant);
  const toggleStatus = useServerFn(adminToggleRestaurantStatus);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    display_name: "",
    restaurant_name: "",
    cuisine: "Levantine",
    area: "Al-Manara",
    phone_number: "",
  });

  async function load() {
    // Fetch restaurants
    const { data: rests } = await supabase
      .from("restaurants")
      .select("id, name, cuisine, city, active, phone_number, contact_email")
      .order("created_at", { ascending: false });

    // Fetch offers and transactions to compute stats per restaurant
    const { data: offers } = await supabase.from("offers").select("restaurant_id");
    const { data: txs } = await supabase.from("transactions").select("restaurant_id, customer_total_price");

    const computedRows = (rests ?? []).map((r) => {
      const restOffers = (offers ?? []).filter((o) => o.restaurant_id === r.id);
      const restTxs = (txs ?? []).filter((t) => t.restaurant_id === r.id);
      const sales = restTxs.reduce((sum, t) => sum + Number(t.customer_total_price || 0), 0);

      return {
        ...r,
        itemCount: restOffers.length,
        totalSales: sales,
      } as Row;
    });

    setRows(computedRows);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: form });
      toast.success("Restaurant account created successfully!");
      setShowForm(false);
      setForm({ ...form, email: "", password: "", display_name: "", restaurant_name: "", phone_number: "" });
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      await toggleStatus({ data: { id, active: !currentStatus } });
      toast.success(`Restaurant ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update status");
    }
  }

  const list = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">Manage Restaurants</h1>
          <p className="text-sm text-muted-foreground">Add new partners and manage existing Ramallah restaurants.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-card hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" /> Add Restaurant
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="space-y-4 rounded-3xl bg-card p-6 shadow-card border border-border">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-extrabold">New Restaurant Registration</h2>
            <p className="text-xs text-muted-foreground">Creates an owner account and a restaurant profile.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Restaurant Info</h3>
              <In label="Restaurant Name" value={form.restaurant_name} onChange={(v) => setForm({ ...form, restaurant_name: v })} required />
              <In label="Cuisine Type" value={form.cuisine} onChange={(v) => setForm({ ...form, cuisine: v })} required />
              <div className="space-y-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Area (Ramallah)</span>
                <select
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                >
                  {RAMALLAH_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Owner Details</h3>
              <In label="Owner Full Name" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} required />
              <In label="Contact Phone" type="tel" value={form.phone_number} onChange={(v) => setForm({ ...form, phone_number: v })} />
              <div className="grid grid-cols-2 gap-2">
                <In label="Login Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <In label="Temp Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create Restaurant"}
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-full bg-card px-4 py-3 shadow-sm border border-border">
        <Search className="size-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search restaurants by name..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {/* Desktop Table view */}
      <div className="hidden md:block rounded-2xl bg-card shadow-card overflow-hidden border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-xs text-muted-foreground border-b border-border">
            <tr>
              <th className="px-5 py-4 font-semibold">Restaurant</th>
              <th className="px-5 py-4 font-semibold">Contact & Area</th>
              <th className="px-5 py-4 text-center font-semibold">Menu Items</th>
              <th className="px-5 py-4 text-right font-semibold">Total Sales</th>
              <th className="px-5 py-4 text-center font-semibold">Status</th>
              <th className="px-5 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                      <Store className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold text-foreground">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.cuisine}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-foreground">{r.city}</p>
                  <p className="text-xs text-muted-foreground">{r.contact_email}</p>
                  {r.phone_number && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="size-3" /> {r.phone_number}</p>}
                </td>
                <td className="px-5 py-4 text-center font-bold text-foreground">{r.itemCount}</td>
                <td className="px-5 py-4 text-right font-bold text-primary">₪{r.totalSales.toFixed(2)}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${r.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                    {r.active ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                    {r.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button onClick={() => handleToggleStatus(r.id, r.active)} className="text-[11px] font-bold text-primary hover:underline">
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No restaurants found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card view */}
      <ul className="md:hidden space-y-3">
        {list.map((r) => (
          <li key={r.id} className="rounded-2xl bg-card p-4 shadow-sm border border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
                  <Store className="size-5" />
                </span>
                <div>
                  <p className="font-bold">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.cuisine} · {r.city}</p>
                </div>
              </div>
              <button onClick={() => handleToggleStatus(r.id, r.active)} className="grid size-8 place-items-center rounded-full hover:bg-secondary">
                <MoreVertical className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
              <div className="text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Items</p>
                <p className="font-bold">{r.itemCount}</p>
              </div>
              <div className="text-center border-l border-border">
                <p className="text-[10px] uppercase text-muted-foreground">Sales</p>
                <p className="font-bold text-primary">₪{r.totalSales}</p>
              </div>
              <div className="text-center border-l border-border">
                <p className="text-[10px] uppercase text-muted-foreground">Status</p>
                <span className={`text-[11px] font-bold ${r.active ? "text-success" : "text-destructive"}`}>{r.active ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function In({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
      />
    </label>
  );
}
