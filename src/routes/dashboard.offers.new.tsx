import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/dashboard/offers/new")({
  component: AddOffer,
});

function AddOffer() {
  const router = useRouter();
  const [original, setOriginal] = useState(12.49);
  const [discounted, setDiscounted] = useState(7.49);
  const pct = original > 0 ? Math.round(((original - discounted) / original) * 100) : 0;
  const [active, setActive] = useState(true);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.navigate({ to: "/dashboard/offers" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="font-display text-xl font-extrabold">Add / Edit Offer</h1>

      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <Field label="Item Name" defaultValue="Teriyaki Chicken Bowl" />

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Discount %</p>
            <div className="rounded-xl bg-secondary px-3 py-2.5 text-sm font-bold text-primary">{pct}%</div>
          </div>
          <Field label="Valid Till" defaultValue="Today, 10:00 PM" />
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
          <textarea
            defaultValue="Grilled chicken glazed with teriyaki sauce, served with steamed rice and veggies."
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
        className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-elevated"
      >
        Save Offer
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
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <input
        {...rest}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
