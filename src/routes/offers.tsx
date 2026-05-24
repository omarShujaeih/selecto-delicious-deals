import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfferCard } from "@/components/offers/OfferCard";
import { categories, fetchPublicOffers, type Offer } from "@/lib/offers-data";
import { useCustomerGuard } from "@/lib/auth-context";
import { withTimeout } from "@/lib/async-timeout";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Selecto | عروض اليوم" }] }),
  component: OffersPage,
});

const cities = [
  { value: "Ramallah", label: "رام الله" },
  { value: "Nablus", label: "نابلس" },
  { value: "Hebron", label: "الخليل" },
  { value: "Bethlehem", label: "بيت لحم" },
  { value: "Jerusalem", label: "القدس" },
];
const categoryLabels: Record<string, string> = { All: "الكل", Burgers: "برغر", Pizzas: "بيتزا", Bowls: "وجبات", Asian: "آسيوي", Sushi: "سوشي" };

function OffersPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState(() => typeof window === "undefined" ? "Ramallah" : localStorage.getItem("selecto_selected_city") || "Ramallah");
  useCustomerGuard();

  useEffect(() => {
    withTimeout(fetchPublicOffers(), 8000, "Loading offers")
      .then((data) => { setOffers(data); setLoadError(null); })
      .catch(() => { setOffers([]); setLoadError("تعذر تحميل العروض. حاول مرة أخرى."); })
      .finally(() => setLoading(false));
  }, []);

  const list = offers.filter((offer) => {
    const cityMatch = (offer.city || "Ramallah").toLowerCase() === selectedCity.toLowerCase();
    const categoryMatch = category === "All" || offer.category === category;
    const text = `${offer.name} ${offer.restaurant} ${offer.cuisine}`.toLowerCase();
    return cityMatch && categoryMatch && (!query.trim() || text.includes(query.trim().toLowerCase()));
  });

  return (
    <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-30 bg-primary px-5 pb-5 pt-5 text-primary-foreground shadow-card">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
              <MapPin className="size-3.5" />
              <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); localStorage.setItem("selecto_selected_city", e.target.value); }} className="bg-transparent text-xs font-black text-white outline-none">
                {cities.map((city) => <option key={city.value} value={city.value} className="bg-primary">{city.label}</option>)}
              </select>
            </div>
            <h1 className="font-display text-3xl font-black" dir="ltr">Selecto</h1>
          </div>
          <button className="grid size-11 place-items-center rounded-2xl bg-white/10"><Bell className="size-5" /></button>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3.5">
          <Search className="size-4 text-white/70" />
          <input value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder="ابحث عن وجبة أو مطعم" className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/55" />
        </div>
      </header>
      <main className="space-y-5 px-5 pt-5">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm" dir="rtl">
          <p className="text-xs font-black text-primary">عروض اليوم</p>
          <h2 className="mt-1 font-display text-xl font-black">وجبات مختارة بسعر نهائي واضح</h2>
          <p className="mt-1 text-xs font-semibold leading-6 text-muted-foreground">اختر العرض، راجع السلة، واستلم وجبتك من المطعم في الوقت المحدد.</p>
        </section>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-black ${category === item ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>
              {categoryLabels[item] ?? item}
            </button>
          ))}
        </div>
        <section className="space-y-3 pb-6">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-black">متوفر الآن</h2><Link to="/explore" className="text-xs font-black text-primary">عرض الكل</Link></div>
          {loading && <StateCard title="جاري تحميل العروض..." />}
          {!loading && loadError && <StateCard title={loadError} />}
          {!loading && !loadError && list.length === 0 && <StateCard title="لا توجد عروض متاحة حالياً." />}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{!loading && !loadError && list.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function StateCard({ title }: { title: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm font-black text-muted-foreground">{title}</div>;
}
