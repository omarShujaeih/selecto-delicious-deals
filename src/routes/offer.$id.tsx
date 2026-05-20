import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Clock, Heart, MapPin, Share2, Star, ShieldAlert, Sparkles, Leaf, Info, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { discountPct, fallbackOfferById as fallbackOffer, type Offer } from "@/lib/offers-data";
import { useFavorites } from "@/lib/favorites";
import { fetchOfferById } from "@/lib/offers-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCustomerGuard } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/offer/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل العرض — Selecto" },
      { name: "description", content: "احصل على خصمك ووفر المال اليوم مع Selecto." },
    ],
  }),
  component: OfferDetails,
});

function OfferDetails() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { toggle, has } = useFavorites();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [offer, setOffer] = useState<(Offer & { restaurant_id?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  useCustomerGuard();

  useEffect(() => {
    fetchOfferById(id)
      .then((o) => setOffer(o ?? fallbackOffer(id) ?? null))
      .catch(() => setOffer(fallbackOffer(id) ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="phone-frame flex flex-col justify-center items-center p-8 bg-background min-h-screen gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-xs text-muted-foreground font-semibold">جاري تحميل تفاصيل الصفقة...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="phone-frame flex flex-col justify-center items-center p-8 text-center bg-background min-h-screen gap-4">
        <span className="text-5xl">🕵️‍♀️</span>
        <h2 className="text-lg font-black">العرض غير متوفر حالياً</h2>
        <p className="text-xs text-muted-foreground px-4">يبدو أن العرض قد نفذ أو تم حذفه من قبل إدارة المطعم.</p>
        <button
          onClick={() => router.navigate({ to: "/offers" })}
          className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-card"
        >
          العودة لتصفح العروض
        </button>
      </div>
    );
  }

  const fav = has(offer.id);
  const pct = discountPct(offer);
  const saved = (offer.originalPrice - offer.discountedPrice).toFixed(0);

  function handleAddToCart() {
    addItem(offer as any); // Cast to handle the restaurant_id property
    toast.success("تم إضافة الوجبة للسلة! 🛒");
  }

  return (
    <div className="phone-frame flex flex-col bg-background min-h-screen text-foreground select-none relative">
      
      {/* Top Banner Cover Image */}
      <div className="relative h-80 w-full overflow-hidden shrink-0">
        <img 
          src={offer.image} 
          alt={offer.name} 
          className="h-full w-full object-cover animate-fade-in duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-black/40" />

        {/* Back and Utility Header Buttons */}
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between z-10">
          <button
            onClick={() => router.navigate({ to: "/offers" })}
            className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/35 hover:scale-105 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("تم نسخ رابط العرض لمشاركته! 🔗");
              }}
              className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/35 hover:scale-105 active:scale-95 transition" 
              aria-label="Share"
            >
              <Share2 className="size-4" />
            </button>
            <button
              onClick={() => {
                if (!user) {
                  toast.error("الرجاء تسجيل الدخول أولاً لحفظ المفضلة");
                  router.navigate({ to: "/auth" });
                  return;
                }
                toggle(offer.id);
                if (fav) {
                  toast.success("تمت الإزالة من المفضلة");
                } else {
                  toast.success("تم الحفظ في المفضلة! 💚");
                }
              }}
              className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/35 hover:scale-105 active:scale-95 transition"
              aria-label="Save"
            >
              <Heart className={`size-4 ${fav ? "fill-discount text-discount" : "text-white"}`} />
            </button>
          </div>
        </div>

        {/* Floating Urgency Tag */}
        <span className="absolute right-4 bottom-5 bg-discount text-white text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-md z-10 animate-bounce">
          🏃‍♂️ بقي عدد محدود جداً!
        </span>
      </div>

      {/* Main Details Body */}
      <main className="flex-1 space-y-6 px-5 pt-4 pb-28">
        
        {/* Deal Header Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
            <span>🏡 {offer.restaurant}</span>
            <span>•</span>
            <span>{offer.cuisine}</span>
          </div>
          <h1 className="font-display text-2xl font-black leading-tight tracking-tight text-foreground">{offer.name}</h1>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-foreground">{offer.rating || "4.8"}</span>
              <span className="text-muted-foreground/75">(140 تقييم)</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-primary">
              📍 Al-Masyoun, Ramallah
            </span>
          </div>
        </div>

        {/* Pricing Overview Row */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-primary/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground">السعر بعد التخفيض</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-3xl font-black text-[#124E3F] dark:text-[#E77B5D]">
                ₪{offer.discountedPrice.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground line-through font-semibold">
                ₪{offer.originalPrice.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-discount bg-discount/10 px-3 py-1.5 rounded-full">
              وفرت ₪{saved} ({pct}% خصم)
            </span>
          </div>
        </div>

        {/* Dynamic Quantity Stock Visualizer */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-discount">عجل! بقي 2 فقط</span>
            <span className="text-muted-foreground">مخزون الوجبة المتاح اليوم</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-discount rounded-full w-1/4 animate-pulse"></div>
          </div>
        </div>

        {/* Discount value card */}
        <section className="bg-emerald-50 dark:bg-emerald-950/20 border border-primary/10 rounded-[1.75rem] p-4.5 space-y-3">
          <div className="flex items-center gap-2">
            <Leaf className="size-4.5 text-primary fill-primary/10" />
            <h3 className="text-xs font-extrabold text-[#124E3F] dark:text-emerald-400 uppercase tracking-wider">ليش هذا العرض مناسب؟</h3>
          </div>
          <p className="text-xs text-[#124E3F]/85 dark:text-emerald-300/80 leading-relaxed font-semibold">
            هذا العرض يعطيك وجبة مختارة من مطعم محلي بسعر أقل، مع توفير مباشر بقيمة <strong>₪{saved}</strong> من ميزانيتك وخصم بنسبة <strong>{pct}%</strong>.
          </p>
        </section>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard icon={Clock} title={offer.pickupTime || "اليوم"} sub="نافذة الاستلام" />
          <InfoCard icon={MapPin} title={`${offer.distanceKm} كم مجاور`} sub="المسافة الجغرافية" />
          <InfoCard icon={Clock} title="اليوم فقط" sub="صلاحية العرض" />
          <InfoCard icon={HelpCircle} title="وجبة عائلية" sub="حجم الحصة المقدر" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">تفاصيل الوجبة</h3>
          <p className="text-xs font-semibold leading-relaxed text-muted-foreground/90 leading-relaxed text-right" dir="rtl">
            {offer.description || "وجبة لذيذة بخصم خاص من المطعم، متاحة ضمن وقت الاستلام المحدد وبسعر ممتاز."}
          </p>
        </div>

        {/* Interactive "How it Works" Onboarding Timeline */}
        <section className="space-y-4 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">خطوات الحصول على عرضك</h3>
          <div className="space-y-3">
            <TimelineStep 
              num="1" 
              title="احجز صفقاتك وادفع رقمياً" 
              desc="أكد حجز وجبتك عبر Selecto لضمان استلامها قبل نفاد الكمية." 
            />
            <TimelineStep 
              num="2" 
              title="استلم الوجبة في الوقت المحدد" 
              desc={`اذهب إلى المطعم خلال نافذة الاستلام (${offer.pickupTime || "المحددة"}) وأظهر لهم الفاتورة.`} 
            />
            <TimelineStep 
              num="3" 
              title="استمتع بوجبتك ووفّر أكثر" 
              desc="أكل لذيذ من مطعمك المفضل بسعر أقل وتجربة طلب واضحة وسريعة." 
            />
          </div>
        </section>

      </main>

      {/* Floating Sticky Bottom Pulse Order Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur px-5 py-4 z-40 max-w-[430px] mx-auto">
        <button
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-elevated transition hover:bg-primary-glow active:scale-95 animate-pulse-glow"
        >
          أضف إلى السلة • ₪{offer.discountedPrice.toFixed(2)}
        </button>
        {!user && (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            يلزم <Link to="/auth" className="font-extrabold text-primary underline">تسجيل الدخول</Link> لتتمكن من إتمام الحجز الفعلي.
          </p>
        )}
      </div>

    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-card border border-border/60 p-3 shadow-sm hover:scale-102 hover:border-primary/10 transition-all">
      <div className="p-1.5 rounded-lg bg-secondary text-primary shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground leading-none">{sub}</div>
        <div className="font-bold text-xs text-foreground truncate mt-1">{title}</div>
      </div>
    </div>
  );
}

function TimelineStep({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="size-7 rounded-full bg-secondary border border-primary/20 text-primary font-black text-xs flex items-center justify-center shrink-0">
        {num}
      </div>
      <div className="space-y-0.5 text-right flex-1" dir="rtl">
        <h4 className="text-xs font-black text-foreground">{title}</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
