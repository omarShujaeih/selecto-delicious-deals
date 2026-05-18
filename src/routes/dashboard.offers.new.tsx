import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRestaurant } from "@/lib/offers-data";

export const Route = createFileRoute("/dashboard/offers/new")({
  component: AddOffer,
});

function AddOffer() {
  const router = useRouter();
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [name, setName] = useState("Teriyaki Chicken Bowl");
  const [description, setDescription] = useState(
    "Grilled chicken glazed with teriyaki sauce, served with steamed rice and veggies.",
  );
  const [image, setImage] = useState(
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  );
  const [category, setCategory] = useState("Bowls");
  const [original, setOriginal] = useState(12.49);
  const [discounted, setDiscounted] = useState(7.49);
  const [validUntil, setValidUntil] = useState("Today, 10:00 PM");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const pct = original > 0 ? Math.round(((original - discounted) / original) * 100) : 0;

  useEffect(() => {
    if (!user) return;
    fetchMyRestaurant(user.id).then((r) => setRestaurantId(r?.id ?? null));
  }, [user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("No restaurant linked to your account.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("offers").insert({
      restaurant_id: restaurantId,
      name,
      description,
      image,
      category,
      cuisine: category,
      original_price: original,
      discounted_price: discounted,
      valid_until: validUntil,
      prep_minutes: "20-25 min",
      active,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Offer saved");
    router.navigate({ to: "/dashboard/offers" });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="font-display text-xl font-extrabold">Add Offer</h1>

      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <Field label="Item Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
        <Field label="Image URL" value={image} onChange={(e) => setImage(e.currentTarget.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" value={category} onChange={(e) => setCategory(e.currentTarget.value)} />
          <Field label="Valid Till" value={validUntil} onChange={(e) => setValidUntil(e.currentTarget.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Original Price ($)"
            type="number"
            step="0.01"
            value={original}
            onChange={(e) => setOriginal(Number(e.currentTarget.value))}
          />
          <Field
            label="Discount Price ($)"
            type="number"
            step="0.01"
            value={discounted}
            onChange={(e) => setDiscounted(Number(e.currentTarget.value))}
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Discount %</p>
          <div className="rounded-xl bg-secondary px-3 py-2.5 text-sm font-bold text-primary">{pct}%</div>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            rows={3}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-sm">
          <span className="font-semibold">Active</span>
          <span
            className={`relative h-6 w-11 rounded-full transition ${active ? "bg-primary" : "bg-muted"}`}
            onClick={() => setActive(!active)}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-card shadow transition-all ${
                active ? "left-5" : "left-0.5"
              }`}
            />
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-elevated disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save Offer"}
      </button>
    </form>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <input
        {...rest}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
