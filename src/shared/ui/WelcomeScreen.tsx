import { Link } from "@tanstack/react-router";
import { ArrowLeft, Flame, MapPin, Search, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { useState } from "react";
import { cities, getPreferredCity, setPreferredCity } from "@/features/customer/city-preference";

const steps = [
  { icon: Search, label: "بحبّش" },
  { icon: ShoppingBag, label: "لقّط" },
  { icon: MapPin, label: "روح استلم" },
];

export function WelcomeScreen() {
  const [selectedCity, setSelectedCity] = useState(getPreferredCity);

  return (
    <div className="phone-frame min-h-svh overflow-hidden bg-[#FDFBF7] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-10 size-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-24 bottom-24 size-64 rounded-full bg-[#DDEAC8]/70 blur-3xl" />
        <div className="absolute right-6 top-24 rotate-6 rounded-full border border-primary/10 bg-white/65 px-3 py-1.5 text-[11px] font-black text-primary/55 shadow-sm">
          آخر الشهر؟
        </div>
        <div className="absolute left-5 top-40 -rotate-6 rounded-full border border-primary/10 bg-white/65 px-3 py-1.5 text-[11px] font-black text-primary/55 shadow-sm">
          لقطة اليوم
        </div>
        <div className="absolute bottom-36 right-7 -rotate-3 rounded-full border border-primary/10 bg-white/65 px-3 py-1.5 text-[11px] font-black text-primary/50 shadow-sm">
          صيدها
        </div>
      </div>
      <main className="safe-top mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-5 pb-6 pt-6 md:px-6 md:py-10" dir="rtl">
        <section className="w-full">
          <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
            <Sparkles className="size-3.5" />
            عروض على قد الجيبة
          </div>

          <h1 className="font-display text-[34px] font-black leading-[1.12] text-slate-900 sm:text-[40px] md:text-[44px]">
            أكل زاكي بسعر أزكى
          </h1>
          <p className="mt-3 max-w-[340px] text-sm font-semibold leading-7 text-slate-600 md:text-base">
            الخصم علينا… والدفع أكيد عليك يا غالي. رد علينا بتفرق معك.
          </p>

          <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-primary/15 bg-primary px-4 py-3 text-primary-foreground shadow-[0_14px_32px_rgba(10,67,42,0.22)]">
            <div>
              <p className="text-[11px] font-black text-white/70">لقطة ساخنة</p>
              <p className="mt-0.5 text-sm font-black">أكلة بتشبع وسعر ما بيوجع</p>
            </div>
            <span className="grid size-11 place-items-center rounded-2xl bg-white/14">
              <Flame className="size-5" />
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5 md:gap-3">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/75 p-3 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" strokeWidth={2} />
                </span>
                <p className="mt-2.5 text-[11px] font-bold leading-tight text-slate-700">
                  {step.label}
                </p>
                {index === 1 && <span className="mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black text-primary">ما بتستنى</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 overflow-hidden rounded-2xl border border-primary/10 bg-white/70 px-3 py-2 text-[10px] font-black text-primary shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"><Tag className="size-3" /> وجبة محترمة بسعر أرحم</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">قبل ما تطير</span>
          </div>
          <label className="mt-4 block rounded-2xl border border-primary/15 bg-white/75 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <span className="mb-2 block text-[11px] font-black text-slate-500">العروض في:</span>
            <select
              value={selectedCity}
              onChange={(event) => {
                setSelectedCity(event.currentTarget.value);
                setPreferredCity(event.currentTarget.value);
              }}
              className="w-full bg-transparent text-sm font-black text-slate-900 outline-none"
            >
              {cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="mt-5 flex flex-col items-center gap-4">
          <Link
            to="/offers"
            className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-base font-black text-primary-foreground shadow-[0_8px_24px_rgba(10,67,42,0.25)] transition-transform active:scale-[0.98]"
          >
            <span>ابدأ التصفح</span>
            <ArrowLeft className="size-5" />
          </Link>

          <Link
            to="/auth"
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            عندك حساب؟ <span className="underline decoration-slate-300 underline-offset-4">تسجيل الدخول</span>
          </Link>

          <div className="mt-2">
            <Link
              to="/portal"
              className="text-[11px] font-normal text-slate-400/90 hover:text-primary/80 transition-colors tracking-wide"
            >
              للمطاعم والإدارة: الدخول إلى البوابة
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
