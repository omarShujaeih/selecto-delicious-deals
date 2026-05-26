import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/auth.context";
import { fetchMyRestaurant } from "@/features/offers/offers.service";
import { updateRestaurantProfile } from "@/features/dashboard/restaurant.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: DashboardSettings,
});

function DashboardSettings() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [city, setCity] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMyRestaurant(user.id).then((r) => {
      if (r) {
        setName(r.name || "");
        setCuisine(r.cuisine || "");
        setCity(r.city || "");
        setContactEmail(r.contact_email || "");
        setAddress(r.address || "");
        setMapUrl(r.map_url || "");
      }
      setLoading(false);
    });
  }, [user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateRestaurantProfile({
        data: {
          name,
          cuisine,
          city,
          contact_email: contactEmail,
          address,
          map_url: mapUrl,
        },
      });
      toast.success("تم تحديث الملف الشخصي بنجاح!");
    } catch (err: any) {
      toast.error(err.message || "فشل في تحديث الملف الشخصي");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-xs text-muted-foreground">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="font-display text-xl font-extrabold">إعدادات المطعم</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
          <Field label="اسم المطعم" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="نوع الطبخ" value={cuisine} onChange={(e) => setCuisine(e.currentTarget.value)} required />
            <Field label="المدينة" value={city} onChange={(e) => setCity(e.currentTarget.value)} required />
          </div>
          <Field label="البريد الإلكتروني للتواصل" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.currentTarget.value)} />
          <Field label="العنوان الفعلي" value={address} onChange={(e) => setAddress(e.currentTarget.value)} />
          <Field label="رابط خرائط جوجل" type="url" value={mapUrl} onChange={(e) => setMapUrl(e.currentTarget.value)} />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-elevated disabled:opacity-60"
        >
          {busy ? "جاري الحفظ..." : "حفظ الإعدادات"}
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
