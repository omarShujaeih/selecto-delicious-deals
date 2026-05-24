import { motion } from "framer-motion";
import { Leaf, Pizza, Salad, Soup, Tag, TicketPercent } from "lucide-react";
import { useEffect } from "react";

const emerald = "#08734F";
const pale = "#C9DFA5";

export function SplashScreen({ hold = false, onFinish }: { hold?: boolean; onFinish?: () => void }) {
  useEffect(() => {
    if (hold || !onFinish) return undefined;
    const timer = window.setTimeout(onFinish, 1500);
    return () => window.clearTimeout(timer);
  }, [hold, onFinish]);

  return (
    <motion.div
      className="phone-frame min-h-screen overflow-hidden bg-[#FFFDF4] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
      >
        <div className="absolute -left-16 -top-14 size-36 rounded-full bg-[#DDEAC8]" />
        <div className="absolute -bottom-20 -right-20 size-44 rounded-full bg-[#DDEAC8]" />
        <div className="absolute left-1/2 top-1/4 size-48 -translate-x-1/2 rounded-full bg-[#EAF3DA]/50 blur-3xl" />
      </motion.div>

      <DecorativeIcons />

      <motion.main
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 pb-14 pt-12"
        initial={{ opacity: 1 }}
        animate={hold ? { opacity: 1 } : { opacity: [1, 1, 0] }}
        transition={hold ? { duration: 0 } : { times: [0, 0.93, 1], duration: 1.5, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <SelectoMark />
          </motion.div>

          <motion.h1
            className="mt-5 font-display text-[clamp(3.5rem,18vw,5.25rem)] font-black leading-none text-[#08734F]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Selecto
          </motion.h1>

          <motion.p
            className="mt-4 text-[clamp(0.95rem,4vw,1.15rem)] font-semibold text-[#08734F]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Great meals. Better prices.
          </motion.p>

          <svg className="mt-3 h-5 w-40" viewBox="0 0 160 20" aria-hidden="true">
            <motion.path
              d="M13 14C48 4 103 3 147 13"
              fill="none"
              stroke={emerald}
              strokeLinecap="round"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ delay: 1.6, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </div>

        <motion.div
          className="mt-20 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="size-9 rounded-full border-[3px] border-[#08734F]/25 border-t-[#08734F]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
          <motion.p
            className="mt-5 text-xs font-semibold text-[#08734F]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
          >
            Finding tasty deals near you...
          </motion.p>
        </motion.div>
      </motion.main>
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
      transition={{ delay: 0.25, duration: 0.35, ease: "easeOut" }}
      aria-hidden="true"
    >
      <Soup className={`${iconClass} left-[13%] top-[11%] size-14 -rotate-12 opacity-55`} strokeWidth={1.25} />
      <Tag className={`${iconClass} right-[15%] top-[14%] size-12 rotate-3 opacity-55`} strokeWidth={1.25} />
      <Salad className={`${iconClass} bottom-[11%] left-[34%] size-14 rotate-12 opacity-45`} strokeWidth={1.25} />
      <Pizza className={`${iconClass} right-[9%] top-[28%] size-16 rotate-12 opacity-55`} strokeWidth={1.25} />
      <TicketPercent className={`${iconClass} bottom-[30%] left-[10%] size-12 -rotate-12 opacity-45`} strokeWidth={1.25} />
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
      <span className="absolute left-[19%] top-[33%] size-3 rounded-full border border-[#C9DFA5] opacity-60" />
      <span className="absolute bottom-[22%] right-[22%] size-3 rounded-full border border-[#C9DFA5] opacity-45" />
    </motion.div>
  );
}
