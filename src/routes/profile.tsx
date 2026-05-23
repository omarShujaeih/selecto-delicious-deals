import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  User as UserIcon,
  ClipboardList,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth, useCustomerGuard } from "@/lib/auth-context";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Selecto" },
      { name: "description", content: "Manage your Selecto account." },
    ],
  }),
  component: ProfilePage,
});

const arabicCities: Record<string, string> = {
  Ramallah: "رام الله",
  Nablus: "نابلس",
  Hebron: "الخليل",
  Bethlehem: "بيت لحم",
  Jerusalem: "القدس",
  Jenin: "جنين",
  Tulkarm: "طولكرم",
  Qalqilya: "قلقيلية",
  Jericho: "أريحا",
};

function ProfilePage() {
  const { user, roles, signOut, isAdmin, isRestaurant } = useAuth();
  useCustomerGuard();
  const nav = useNavigate();
  const name = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "زائر";
  const roleLabel = isAdmin ? "مدير النظام" : isRestaurant ? "صاحب مطعم" : roles.length ? "عميل سيلكتو" : "زائر";

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selecto_selected_city") || "Ramallah";
    }
    return "Ramallah";
  });

  const cityLabel = arabicCities[selectedCity] || selectedCity;

  const rows = [
    { icon: UserIcon, label: "بيانات الحساب", value: name },
    { icon: MapPin, label: "المدينة المفضلة", value: cityLabel },
    { icon: Bell, label: "التنبيهات", value: "مفعلة" },
    { icon: HelpCircle, label: "المساعدة والدعم", value: null },
    { icon: Settings, label: "إعدادات التطبيق", value: null },
  ];

  return (
    <div className="phone-frame flex flex-col min-h-screen pb-20 bg-background text-foreground select-none">
      <header className="bg-gradient-to-br from-[#174d3d] to-[#123f34] px-5 pb-16 pt-8 text-white rounded-b-[2rem] shadow-md relative z-10" dir="rtl">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-full bg-white/10 border border-white/20 text-2xl font-black uppercase text-emerald-400">
            {name.slice(0, 1)}
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] opacity-75">أهلاً بك،</p>
            <h1 className="font-display text-lg font-black truncate">{name}</h1>
            <p className="truncate text-xs opacity-75 mt-0.5">{user?.email ?? "تصفح كزائر"}</p>
            <span className="mt-2 inline-block rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-[9px] font-black text-emerald-300">
              {roleLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="-mt-8 flex-1 space-y-4 px-5 relative z-20">
        
        {/* Guest sign in notice */}
        {!user && (
          <Link
            to="/auth"
            className="block rounded-2xl bg-primary py-4 text-center text-xs font-black text-primary-foreground shadow-card hover:bg-primary-glow transition-all"
          >
            سجل دخولك أو أنشئ حساباً الآن
          </Link>
        )}

        {/* Shortcuts action grid */}
        <div className="grid grid-cols-3 gap-3" dir="rtl">
          <Link
            to="/orders"
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-card border border-border/50 shadow-sm hover:scale-102 hover:border-primary/10 transition-all text-center"
          >
            <div className="p-2 rounded-xl bg-secondary text-primary mb-2">
              <ClipboardList className="size-5" />
            </div>
            <span className="text-[10px] font-black text-foreground">طلباتي</span>
          </Link>

          <Link
            to="/favorites"
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-card border border-border/50 shadow-sm hover:scale-102 hover:border-primary/10 transition-all text-center"
          >
            <div className="p-2 rounded-xl bg-secondary text-discount mb-2">
              <Heart className="size-5 fill-discount text-discount" />
            </div>
            <span className="text-[10px] font-black text-foreground">المفضلة</span>
          </Link>

          <Link
            to="/cart"
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-card border border-border/50 shadow-sm hover:scale-102 hover:border-primary/10 transition-all text-center"
          >
            <div className="p-2 rounded-xl bg-secondary text-primary mb-2">
              <ShoppingBag className="size-5" />
            </div>
            <span className="text-[10px] font-black text-foreground">السلة</span>
          </Link>
        </div>

        {/* Settings rows */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden" dir="rtl">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`flex w-full items-center gap-3 px-4 py-4 text-right text-xs ${
                i !== rows.length - 1 ? "border-b border-border/60" : ""
              }`}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary shrink-0">
                <r.icon className="size-4" />
              </span>
              <span className="flex-1 font-bold text-foreground">{r.label}</span>
              {r.value && (
                <span className="text-[10px] text-muted-foreground/80 font-semibold truncate max-w-[120px] bg-secondary px-2 py-0.5 rounded">
                  {r.value}
                </span>
              )}
              <ChevronRight className="size-4 text-muted-foreground rotate-180 shrink-0" />
            </div>
          ))}
        </div>

        {/* Dashboard shortcut for staff only */}
        {(isRestaurant || isAdmin) && (
          <Link
            to="/dashboard"
            className="block rounded-2xl border border-primary/20 bg-primary/5 py-4 text-center text-xs font-black text-primary shadow-sm hover:bg-primary/10 transition-colors"
          >
            الانتقال للوحة التحكم ({isAdmin ? "المدير" : "المطعم"})
          </Link>
        )}

        {/* Log out */}
        {user && (
          <button
            onClick={async () => {
              await signOut();
              nav({ to: "/" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-4 text-xs font-black text-discount active:scale-95 transition-all hover:bg-discount/10"
          >
            <LogOut className="size-4" />
            <span>تسجيل الخروج</span>
          </button>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
