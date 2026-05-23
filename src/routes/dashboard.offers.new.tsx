import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { fetchMyRestaurant } from "@/lib/offers-data";
import { createOffer } from "@/lib/restaurant.functions";
import { OfferCard } from "@/components/offers/OfferCard";

export const Route = createFileRoute("/dashboard/offers/new")({
  component: AddOffer,
});

function AddOffer() {
  const router = useRouter();
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("Restaurant Name");
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
  const [pickupTime, setPickupTime] = useState("12:30 PM");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const pct = original > 0 ? Math.round(((original - discounted) / original) * 100) : 0;

  useEffect(() => {
    if (!user) return;
    fetchMyRestaurant(user.id).then((r) => {
      setRestaurantId(r?.id ?? null);
      if (r?.name) setRestaurantName(r.name);
    });
  }, [user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("No restaurant linked to your account.");
      return;
    }
    setBusy(true);
    try {
      await createOffer({
        data: {
          name,
          description,
          image,
          category,
          cuisine: category,
          original_price: original,
          discounted_price: discounted, // This is restaurant_price
          valid_until: validUntil,
          pickup_time: pickupTime,
          active,
        }
      });
      toast.success("Offer saved");
      router.navigate({ to: "/dashboard/offers" });
    } catch (err: any) {
      toast.error(err.message || "Failed to save offer");
    } finally {
      setBusy(false);
    }
  }

  // Create mock offer for live preview
  const previewOffer = {
    id: "preview",
    restaurant: restaurantName,
    name: name || "Offer Name",
    category,
    rating: 5.0,
    distance: "0.0 km",
    pickupTime: pickupTime || "Pickup Time",
    originalPrice: original || 0,
    discountedPrice: discounted || 0,
    image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isPublic: active,
  };

  const commission = discounted * 0.20;
  const customerPrice = discounted + commission;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-extrabold">Add New Item</h1>
      
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Preview</p>
        <div className="pointer-events-none">
          <OfferCard offer={previewOffer as any} />
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">

      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <Field label="Item Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
        <Field label="Image URL" value={image} onChange={(e) => setImage(e.currentTarget.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" value={category} onChange={(e) => setCategory(e.currentTarget.value)} />
          <Field label="Valid Till" value={validUntil} onChange={(e) => setValidUntil(e.currentTarget.value)} />
        </div>
        <Field
          label="Pickup Time"
          placeholder="e.g. 12:30 PM"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.currentTarget.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Original Menu Price (₪)"
            type="number"
            step="0.01"
            value={original}
            onChange={(e) => setOriginal(Number(e.currentTarget.value))}
          />
          <Field
            label="Your Payout (₪)"
            type="number"
            step="0.01"
            value={discounted}
            onChange={(e) => setDiscounted(Number(e.currentTarget.value))}
          />
        </div>
        
        <div className="rounded-xl bg-secondary/50 p-3 mt-2 text-sm">
          <p className="font-semibold mb-1">Pricing Breakdown:</p>
          <div className="flex justify-between text-muted-foreground">
            <span>Your Payout:</span>
            <span>₪{discounted.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Selecto Commission (20%):</span>
            <span>+ ₪{commission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-foreground mt-1 pt-1 border-t border-border">
            <span>Customer Final Price:</span>
            <span>₪{customerPrice.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Discount %</p>
          <div className="rounded-xl bg-secondary px-3 py-2.5 text-sm font-bold text-primary">{pct}% OFF</div>
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
        {busy ? "Saving…" : "Save Item"}
      </button>
    </form>
    </div>
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
