import { Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Search, ShoppingBag } from "lucide-react";

const steps = [
  { icon: Search, label: "استكشف" },
  { icon: ShoppingBag, label: "احجز" },
  { icon: MapPin, label: "استلم في الوقت المحدد" },
];

export function WelcomeScreen() {
  return (
    <div className="phone-frame min-h-screen overflow-hidden bg-[#FDFBF7] text-slate-900">
      <main className="safe-top flex min-h-screen flex-col px-6 pb-8" dir="rtl">
        <section className="flex flex-1 flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary border border-primary/20">
            توفير مميز
          </div>

          <h1 className="font-display text-[44px] font-black leading-[1.1] text-slate-900 tracking-tight">
            وفّر على وجبتك القادمة
          </h1>
          <p className="mt-4 max-w-[300px] text-base font-semibold leading-relaxed text-slate-600">
            اكتشف عروض وجبات قريبة منك، تصفّح بسهولة وادفع السعر فقط.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {steps.map((step) => (
              <div
                key={step.label}
                className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/70 p-3 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="size-6" strokeWidth={2} />
                </span>
                <p className="mt-3 text-[11px] font-bold leading-tight text-slate-700">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 flex flex-col items-center gap-5">
          <Link
            to="/offers"
            className="flex w-full items-center justify-between rounded-2xl bg-primary px-6 py-4 text-lg font-black text-primary-foreground shadow-[0_8px_24px_rgba(10,67,42,0.25)] transition-transform active:scale-[0.98]"
          >
            <span>ابدأ التصفح</span>
            <ArrowLeft className="size-6" />
          </Link>

          <Link
            to="/auth"
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            عندك حساب؟ <span className="underline decoration-slate-300 underline-offset-4">تسجيل الدخول</span>
          </Link>

          <div className="mt-6">
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
