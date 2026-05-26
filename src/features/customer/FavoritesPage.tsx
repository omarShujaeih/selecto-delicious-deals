import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/shared/layout/BottomNav";
import { OfferCard } from "@/features/offers/OfferCard";
import { fetchPublicOffers, type Offer } from "@/features/offers/offers.service";
import { useCustomerGuard } from "@/features/auth/auth.context";
import { useFavorites } from "@/features/customer/favorites.service";
import { withTimeout } from "@/shared/lib/async-timeout";

export const Route = createFileRoute("/favorites")({ head: () => ({ meta: [{ title: "المفضلة | Selecto" }] }), component: FavoritesPage });

function FavoritesPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { ids } = useFavorites();
  useCustomerGuard();
  useEffect(() => { withTimeout(fetchPublicOffers(), 8000, "Loading favorites").then(setOffers).catch(() => setOffers([])).finally(() => setLoading(false)); }, []);
  const saved = offers.filter((offer) => ids.includes(offer.id));
  return (
    <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
      <header className="border-b border-border bg-card px-5 py-5" dir="rtl"><div className="flex items-center justify-between"><div><h1 className="font-display text-2xl font-black">المفضلة</h1><p className="mt-1 text-xs font-bold text-muted-foreground">اللقطات اللي حفظتها للرجوع إلها بسرعة.</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-primary">{saved.length}</span></div></header>
      <main className="px-5 py-5">
        {loading ? <StateCard title="نحضّر لك اللقطات المحفوظة..." /> : saved.length === 0 ? <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"><div><div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-discount"><Heart className="size-7" /></div><h2 className="mt-4 font-display text-lg font-black">لسه ما حفظت ولا عرض</h2><p className="mt-2 text-sm font-semibold leading-7 text-muted-foreground">لما تلاقي لقطة مرتبة، احفظها هون.</p><Link to="/offers" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">تصفح اللقطات</Link></div></div> : <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{saved.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>}
      </main>
      <BottomNav />
    </div>
  );
}
function StateCard({ title }: { title: string }) { return <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm font-black text-muted-foreground">{title}</div>; }
