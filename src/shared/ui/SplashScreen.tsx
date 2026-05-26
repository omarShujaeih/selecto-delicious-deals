import { motion } from "framer-motion";
import { Leaf, MapPin, Pizza, Salad, Search, ShoppingBag, Tag, Utensils } from "lucide-react";
import { useEffect } from "react";

const emerald = "#08734F";
const SPLASH_DURATION_MS = 8000;
const seconds = SPLASH_DURATION_MS / 1000;

export function SplashScreen({ hold = false, onFinish }: { hold?: boolean; onFinish?: () => void }) {
  useEffect(() => {
    if (hold || !onFinish) return undefined;
    const timer = window.setTimeout(onFinish, SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [hold, onFinish]);

  return (
    <motion.div
      className="phone-frame min-h-screen overflow-hidden bg-[#FFFDF4] text-center"
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={hold ? { opacity: 1 } : { opacity: [0, 1, 1, 0] }}
      transition={hold ? { duration: 0.5 } : { duration: seconds, times: [0, 0.1, 0.9, 1], ease: "easeInOut" }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.65, ease: "easeOut" }}
      >
        <div className="absolute -left-16 -top-14 size-36 rounded-full bg-[#DDEAC8]/85" />
        <div className="absolute -bottom-20 -right-20 size-44 rounded-full bg-[#DDEAC8]/80" />
        <div className="absolute left-1/2 top-1/4 size-52 -translate-x-1/2 rounded-full bg-[#EAF3DA]/55 blur-3xl" />
      </motion.div>

      <DecorativeIcons />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 pb-14 pt-12">
        <div className="flex w-full flex-col items-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: [0.8, 1.05, 1], y: 0 }}
            transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DDEAC8]/60 blur-2xl" />
            <SelectoMark />
          </motion.div>

          <motion.h1
            className="mt-5 font-display text-5xl font-black leading-none text-[#08734F]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.7, ease: "easeOut" }}
          >
            Selecto
          </motion.h1>

          <motion.div
            className="relative mt-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.1, duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-lg font-black text-[#08734F]">وجبات قريبة. أسعار أوفر.</p>
            <svg
              className="absolute -bottom-3 left-1/2 h-4 w-40 -translate-x-1/2"
              viewBox="0 0 160 16"
              aria-hidden="true"
              style={{ transform: "translateX(-50%) rotateY(180deg)" }}
            >
              <motion.path
                d="M10 8 Q 80 16 150 8"
                fill="none"
                stroke={emerald}
                strokeLinecap="round"
                strokeWidth="2.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.86 }}
                transition={{ delay: 3.8, duration: 0.7, ease: "easeOut" }}
              />
            </svg>
          </motion.div>
        </div>

        <div className="mt-10 flex gap-3">
          {[
            { icon: Search, text: "استكشف" },
            { icon: ShoppingBag, text: "احجز" },
            { icon: MapPin, text: "استلم" },
          ].map((step, index) => (
            <motion.div
              key={step.text}
              className="flex items-center gap-1.5 rounded-full border border-[#08734F]/20 bg-[#FFFDF4] px-3 py-1.5 shadow-sm"
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 4.5 + index * 0.25, duration: 0.5, ease: "easeOut" }}
            >
              <step.icon className="size-3.5 text-[#08734F]" strokeWidth={2.5} />
              <span className="text-xs font-bold text-[#08734F]">{step.text}</span>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-6 text-sm font-semibold text-[#08734F]/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.3, duration: 0.9, ease: "easeOut" }}
        >
          اكتشف، احجز، واستلم في الوقت المحدد
        </motion.p>

        <motion.div
          className="absolute bottom-16 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 6.2, duration: 0.65, ease: "easeOut" }}
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-2 rounded-full bg-[#08734F]"
                animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.45, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
              />
            ))}
          </div>
          <p className="mt-4 text-xs font-bold text-[#08734F]">نحضر لك أفضل العروض...</p>
        </motion.div>
      </main>
    </motion.div>
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

function DecorativeIcons() {
  const iconClass = "absolute text-[#C9DFA5]";

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
      aria-hidden="true"
    >
      <Utensils className={`${iconClass} left-[13%] top-[11%] size-14 -rotate-12 opacity-55`} strokeWidth={1.25} />
      <Tag className={`${iconClass} right-[15%] top-[14%] size-12 rotate-3 opacity-55`} strokeWidth={1.25} />
      <Salad className={`${iconClass} bottom-[11%] left-[34%] size-14 rotate-12 opacity-45`} strokeWidth={1.25} />
      <Pizza className={`${iconClass} right-[9%] top-[28%] size-16 rotate-12 opacity-55`} strokeWidth={1.25} />
      <MapPin className={`${iconClass} bottom-[30%] left-[10%] size-12 -rotate-12 opacity-45`} strokeWidth={1.25} />
      <Leaf className={`${iconClass} left-[48%] top-[14%] size-5 -rotate-12 opacity-65`} strokeWidth={1.25} />
      <Leaf className={`${iconClass} right-[31%] top-[31%] size-5 rotate-12 opacity-55`} strokeWidth={1.25} />
      <Leaf className={`${iconClass} bottom-[17%] left-[14%] size-5 -rotate-12 opacity-55`} strokeWidth={1.25} />
      <div className="absolute right-8 top-8 grid grid-cols-4 gap-2 opacity-45">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="size-1 rounded-full bg-[#C9DFA5]" />
        ))}
      </div>
      <div className="absolute bottom-10 left-4 grid grid-cols-3 gap-2 opacity-35">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="size-1 rounded-full bg-[#C9DFA5]" />
        ))}
      </div>
    </motion.div>
  );
}
