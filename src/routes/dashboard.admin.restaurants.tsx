import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Search, Star, Store } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminCreateRestaurant } from "@/lib/admin.functions";

export const Route = createFileRoute("/dashboard/admin/restaurants")({
  component: ManageRestaurants,
});

type Row = {
  id: string;
  name: string;
  cuisine: string;
  city: string | null;
  active: boolean;
  rating: number;
};

function ManageRestaurants() {
  const create = useServerFn(adminCreateRestaurant);
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
    city: "Ramallah",
  });

  async function load() {
    const { data } = await supabase
      .from("restaurants")
      .select("id,name,cuisine,city,active,rating")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: form });
      toast.success("Restaurant account created");
      setShowForm(false);
      setForm({ ...form, email: "", password: "", display_name: "", restaurant_name: "" });
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  const list = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold">Manage Restaurants</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-card"
        >
          <Plus className="size-3.5" /> New
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="space-y-2 rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs font-semibold text-muted-foreground">Create restaurant account</p>
          <div className="grid grid-cols-2 gap-2">
            <In label="Restaurant name" value={form.restaurant_name} onChange={(v) => setForm({ ...form, restaurant_name: v })} required />
            <In label="Cuisine" value={form.cuisine} onChange={(v) => setForm({ ...form, cuisine: v })} required />
          </div>
          <In label="Owner name" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} required />
          <div className="grid grid-cols-2 gap-2">
            <In label="Login email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <In label="Temp password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
          </div>
          <In label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
      )}

      <div className="flex items-center gap-2 rounded-full bg-card px-3 py-2.5 shadow-card">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search restaurants…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <ul className="space-y-2">
        {list.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
              <Store className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{r.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {r.cuisine} · {r.city ?? "—"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold">
                <Star className="size-3 fill-primary text-primary" /> {r.rating}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                r.active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {r.active ? "Active" : "Pending"}
            </span>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl bg-card p-6 text-center text-xs text-muted-foreground shadow-card">
            No restaurants yet.
          </li>
        )}
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
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
