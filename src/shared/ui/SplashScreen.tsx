import { motion } from "framer-motion";
import { useEffect } from "react";

const emerald = "#08734F";
const SPLASH_DURATION_MS = 10500;
const seconds = SPLASH_DURATION_MS / 1000;

export function SplashScreen({ hold = false, onFinish }: { hold?: boolean; onFinish?: () => void }) {
  useEffect(() => {
    if (hold || !onFinish) return undefined;
    const timer = window.setTimeout(onFinish, SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [hold, onFinish]);

  return (
    <motion.div
      className="phone-frame relative min-h-screen overflow-hidden bg-[#FFFDF4] text-center"
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={hold ? { opacity: 1 } : { opacity: [0, 1, 1, 0] }}
      transition={hold ? { duration: 0.45 } : { duration: seconds, times: [0, 0.08, 0.92, 1], ease: "easeInOut" }}
    >
      <SoftBackground />
      <FloatingWords />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-12">
        <motion.div
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#08734F]/15 bg-white/60 px-4 py-2 text-xs font-black text-[#08734F] shadow-sm backdrop-blur"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.55, ease: "easeOut" }}
        >
          <span className="size-2 rounded-full bg-[#08734F]" />
          رادار اللقطة شغّال
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.78, y: 12 }}
          animate={{ opacity: 1, scale: [0.78, 1.06, 1], y: 0 }}
          transition={{ delay: 1.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <RadarRings />
          <SelectoMark />
        </motion.div>

        <motion.h1
          className="mt-6 font-display text-5xl font-black leading-none text-[#08734F]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.25, duration: 0.65, ease: "easeOut" }}
        >
          Selecto
        </motion.h1>

        <motion.div
          className="mt-4 max-w-xs"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.0, duration: 0.65, ease: "easeOut" }}
        >
          <p className="font-display text-2xl font-black leading-tight text-[#102033]">
            أكل بشبع بسعر ما بوجع
          </p>
          <motion.div
            className="mx-auto mt-3 h-1 w-28 rounded-full bg-[#08734F]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 3.65, duration: 0.55, ease: "easeOut" }}
            style={{ transformOrigin: "right" }}
          />
          <p className="mt-4 text-sm font-bold leading-7 text-[#08734F]/75">
            آخر الشهر؟ ولا يهمك… بنفتشلك على السعر الأرحم.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 rounded-2xl border border-[#08734F]/12 bg-[#08734F] px-5 py-3 text-white shadow-[0_18px_38px_rgba(8,115,79,0.2)]"
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 4.65, duration: 0.65, ease: "easeOut" }}
        >
          <p className="text-[11px] font-black text-white/70">رسالة من الجيبة</p>
          <p className="mt-0.5 text-sm font-black">الخصم علينا… والدفع أكيد عليك يا غالي</p>
        </motion.div>

        <motion.div
          className="absolute bottom-14 flex flex-col items-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 7.25, duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-2 rounded-full bg-[#08734F]"
                animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.45, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
              />
            ))}
          </div>
          <p className="mt-4 text-xs font-black text-[#08734F]">ثواني ونفتحلك اللقطات...</p>
        </motion.div>
      </main>
    </motion.div>
  );
}

function SoftBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -right-20 top-8 size-56 rounded-full bg-[#DDEAC8]/80 blur-3xl" />
      <div className="absolute -left-24 bottom-12 size-64 rounded-full bg-[#DDEAC8]/65 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#08734F]/5" />
      <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#08734F]/7" />
      <div className="absolute right-8 top-9 grid grid-cols-4 gap-2 opacity-35">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="size-1 rounded-full bg-[#08734F]/35" />
        ))}
      </div>
    </div>
  );
}

function FloatingWords() {
  const words = [
    { text: "لقطة اليوم", className: "right-[7%] top-[16%] rotate-3" },
    { text: "على قد الجيبة", className: "left-[7%] top-[21%] -rotate-6" },
    { text: "قبل ما تطير", className: "right-[8%] top-[36%] -rotate-3" },
    { text: "سكنات ودوام", className: "left-[8%] bottom-[27%] rotate-6" },
    { text: "صيدها", className: "right-[16%] bottom-[19%] rotate-3" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {words.map((item, index) => (
        <motion.span
          key={item.text}
          className={`absolute rounded-full border border-[#08734F]/10 bg-white/55 px-3 py-1.5 text-[11px] font-black text-[#08734F]/42 shadow-sm backdrop-blur ${item.className}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 + index * 0.16, duration: 0.55, ease: "easeOut" }}
        >
          {item.text}
        </motion.span>
      ))}
    </div>
  );
}

function RadarRings() {
  return (
    <div className="absolute left-1/2 top-1/2 -z-10 grid size-48 -translate-x-1/2 -translate-y-1/2 place-items-center">
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className="absolute rounded-full border border-[#08734F]/15"
          initial={{ width: 86, height: 86, opacity: 0 }}
          animate={{ width: [86, 160], height: [86, 160], opacity: [0, 0.42, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: ring * 0.42, ease: "easeOut" }}
        />
      ))}
      <div className="size-36 rounded-full bg-[#DDEAC8]/55 blur-2xl" />
    </div>
  );
}

function SelectoMark() {
  return (
    <svg className="h-28 w-28 drop-shadow-[0_18px_30px_rgba(8,115,79,0.13)]" viewBox="0 0 128 128" aria-hidden="true">
      <path
        d="M34 48h60l-5.7 50.8A12 12 0 0 1 76.4 109H51.6a12 12 0 0 1-11.9-10.2L34 48Z"
        fill={emerald}
      />
      <path d="M48 48V34.5C48 23.2 55.4 15 64 15s16 8.2 16 19.5V48" fill="none" stroke={emerald} strokeLinecap="round" strokeWidth="8" />
      <path d="M56 58 45 91" stroke="#FFFDF4" strokeLinecap="round" strokeWidth="5" />
      <path d="M65 60 54 94" stroke="#FFFDF4" strokeLinecap="round" strokeWidth="5" />
      <path d="M73 64 63 92" stroke="#FFFDF4" strokeLinecap="round" strokeWidth="5" />
      <path
        d="M76 84c13-22 35-18 38-18-2 15-13 29-30 28-7-.4-10-4.6-8-10Z"
        fill="#6FBE45"
        stroke="#FFFDF4"
        strokeWidth="3"
      />
      <path d="M82 88c8-8 17-12 28-17" stroke="#FFFDF4" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}
