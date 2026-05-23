import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Selecto | خصومات المطاعم في رام الله" },
      {
        name: "description",
        content:
          "اكتشف عروض وخصومات يومية على وجبات مختارة من مطاعم محلية في رام الله.",
      },
      { property: "og:title", content: "Selecto | خصومات المطاعم في رام الله" },
      {
        property: "og:description",
        content: "خصومات يومية على وجبات مختارة من مطاعم محلية.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, isAdmin, isRestaurant, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (showSplash || loading) return;
    if (!user) {
      nav({ to: "/offers" });
    } else {
      nav({ to: isAdmin || isRestaurant ? "/dashboard" : "/offers" });
    }
  }, [showSplash, loading, user, isAdmin, isRestaurant, nav]);

  return (
    <div className="relative flex min-h-screen w-full select-none flex-col overflow-hidden bg-[#123f32] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.08),transparent_27%),linear-gradient(150deg,#1d5f46_0%,#123f32_48%,#0e2f28_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle_at_18%_100%,rgba(122,176,139,0.2),transparent_42%)]" />

      {showSplash ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <BrandLockup />
          <p className="mt-2 text-[12px] font-semibold text-white/76">
            خصومات لذيذة من مطاعمك المفضلة
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <BrandLockup />
          <p className="mt-3 max-w-[280px] text-[12px] font-semibold leading-relaxed text-white/78">
            اكتشف عروض وخصومات يومية على وجبات مختارة من أفضل المطاعم حولك
          </p>
          <Link
            to="/offers"
            className="mt-9 rounded-full bg-white px-8 py-3 text-sm font-black text-[#123f32] shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition hover:bg-white/95 active:scale-95"
          >
            ابدأ الآن
          </Link>
        </div>
      )}
    </div>
  );
}

function BrandLockup() {
  return (
    <div className="flex items-center justify-center gap-3" dir="ltr">
      <div className="grid size-12 place-items-center rounded-[1rem] bg-white/14 shadow-[0_16px_36px_rgba(0,0,0,0.14)] ring-1 ring-white/10 backdrop-blur-md">
        <BadgeCheck className="size-6 text-white" strokeWidth={2.35} />
      </div>
      <h1 className="font-sans text-[2.65rem] font-black leading-none text-white md:text-5xl">
        Selecto
      </h1>
    </div>
  );
}
