import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, MapPin, Search } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfferCard } from "@/components/offers/OfferCard";
import { categories, fallbackOffers, fetchPublicOffers, type Offer } from "@/lib/offers-data";
import { useCustomerGuard } from "@/lib/auth-context";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Selecto | عروض المطاعم" },
      { name: "description", content: "تصفح خصومات المطاعم اليومية على Selecto." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  useCustomerGuard();

  useEffect(() => {
    fetchPublicOffers()
      .then((d) => setOffers(d.length ? d : fallbackOffers))
      .catch(() => setOffers(fallbackOffers))
      .finally(() => setLoading(false));
  }, []);

  const list = offers.filter(
    (o) =>
      (cat === "All" || o.category === cat) &&
      (q === "" ||
        o.name.toLowerCase().includes(q.toLowerCase()) ||
        o.restaurant.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="phone-frame relative flex min-h-screen select-none flex-col bg-background pb-20 font-sans text-foreground">
      <div className="relative z-10 rounded-b-[2rem] bg-gradient-to-b from-[#174d3d] to-[#123f34] px-5 pb-16 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col text-white">
            <div className="flex items-center gap-1 opacity-90">
              <MapPin className="size-3.5" />
              <span className="text-xs font-semibold">رام الله</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <h1 className="text-2xl font-black leading-none" dir="ltr">
                Selecto
              </h1>
            </div>
          </div>
          <button className="relative grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
            <Bell className="size-5 text-white" />
            <span className="absolute top-2 right-2.5 size-2 bg-orange-500 rounded-full border-2 border-[#154639]"></span>
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-3.5 border border-white/20 backdrop-blur-sm mt-6">
          <Search className="size-4 text-white/70" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن مطعم أو وجبة..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
          />
        </div>
      </div>

      <main className="relative z-20 -mt-8 flex flex-1 flex-col space-y-5 px-5">
        <section className="rounded-2xl border border-emerald-900/5 bg-white p-4 shadow-[0_10px_30px_rgba(18,63,50,0.08)]">
          <p className="text-xs font-bold text-primary">عروض اليوم</p>
          <h2 className="mt-1 text-lg font-black text-gray-950">خصومات مختارة من مطاعم قريبة</h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            اختر العرض، أكد الطلب، والتزم بوقت الاستلام المحدد من المطعم.
          </p>
        </section>

        <div className="-mx-5 px-5 flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                cat === c
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {categoryLabels[c] ?? c}
            </button>
          ))}
        </div>

        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900">متوفر الآن</h2>
            <Link to="/explore" className="text-sm font-bold text-[#124E3F] hover:opacity-80 transition-opacity">
              عرض الكل
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 col-span-full">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <p className="text-xs text-muted-foreground">جاري تحميل العروض...</p>
              </div>
            )}
            
            {!loading && list.map((o) => (
              <div className="animate-fade-in-up" key={o.id}>
                <OfferCard offer={o} />
              </div>
            ))}
            
            {!loading && list.length === 0 && (
              <div className="py-16 text-center space-y-3 bg-gray-50 rounded-3xl p-8 border border-dashed border-gray-200 col-span-full">
                <h3 className="text-sm font-bold text-gray-900">لا توجد عروض مطابقة</h3>
                <p className="text-xs text-gray-500">
                  جرب البحث باسم آخر أو اختر تصنيف مختلف.
                </p>
              </div>
            )}
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}

const categoryLabels: Record<string, string> = {
  All: "الكل",
  Burgers: "برغر",
  Pizzas: "بيتزا",
  Bowls: "وجبات",
  Asian: "آسيوي",
  Sushi: "سوشي",
};
