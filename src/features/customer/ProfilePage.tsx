import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronLeft,
  ClipboardList,
  FileText,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";
import { useState, type ComponentType } from "react";

import { BottomNav } from "@/shared/layout/BottomNav";
import { useAuth, useCustomerGuard } from "@/features/auth/auth.context";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "حسابي | Selecto" },
      { name: "description", content: "إدارة حسابك على Selecto." },
    ],
  }),
  component: ProfilePage,
});

const cityLabels: Record<string, string> = {
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
  const navigate = useNavigate();
  useCustomerGuard();

  const [selectedCity] = useState(() => {
    if (typeof window === "undefined") return "Ramallah";
    return localStorage.getItem("selecto_selected_city") || "Ramallah";
  });

  const name =
    (user?.user_metadata?.display_name as string) ||
    user?.email?.split("@")[0] ||
    "زائر";
  const roleLabel = isAdmin
    ? "أدمن"
    : isRestaurant
      ? "مطعم"
      : roles.length
        ? "عميل Selecto"
        : "زائر";

  const rows: Array<{
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
    to?: "/support" | "/privacy" | "/terms" | "/delete-account";
  }> = [
    { icon: User, label: "بيانات الحساب", value: name },
    {
      icon: MapPin,
      label: "المدينة المفضلة",
      value: cityLabels[selectedCity] || selectedCity,
    },
    { icon: Bell, label: "التنبيهات", value: "قريباً" },
    { icon: HelpCircle, label: "المساعدة والدعم", value: "تواصل معنا", to: "/support" as const },
    { icon: ShieldCheck, label: "سياسة الخصوصية", value: "البيانات", to: "/privacy" },
    { icon: FileText, label: "الشروط والأحكام", value: "الاستخدام", to: "/terms" },
    { icon: Trash2, label: "حذف الحساب", value: "البيانات", to: "/delete-account" },
  ];

  return (
    <div className="phone-frame min-h-screen bg-background pb-20 text-foreground">
      <header
        className="safe-top bg-primary px-5 pb-14 text-primary-foreground"
        dir="rtl"
      >
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/12 text-2xl font-black">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white/70">أهلاً بك</p>
            <h1 className="mt-1 truncate font-display text-xl font-black">
              {name}
            </h1>
            <p className="mt-1 truncate text-xs font-semibold text-white/70">
              {user?.email ?? "تصفح كزائر"}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-white/12 px-3 py-1 text-[10px] font-black">
              {roleLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="-mt-8 space-y-4 px-5" dir="rtl">
        {!user && (
          <Link
            to="/auth"
            className="block rounded-2xl bg-card py-4 text-center text-sm font-black text-primary shadow-card"
          >
            سجل دخولك أو أنشئ حساباً
          </Link>
        )}

        <section className="grid grid-cols-3 gap-3">
          <Shortcut to="/orders" icon={ClipboardList} label="طلباتي" />
          <Shortcut to="/favorites" icon={Heart} label="المفضلة" />
          <Shortcut to="/cart" icon={ShoppingBag} label="السلة" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {rows.map((row, index) => {
            const content = (
              <>
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                  <row.icon className="size-4" />
                </span>
                <span className="flex-1 font-black">{row.label}</span>
                <span className="max-w-[130px] truncate text-xs font-bold text-muted-foreground">
                  {row.value}
                </span>
                <ChevronLeft className="size-4 text-muted-foreground" />
              </>
            );
            const className = `flex items-center gap-3 px-4 py-4 text-sm ${
              index !== rows.length - 1 ? "border-b border-border" : ""
            }`;

            return row.to ? (
              <Link key={row.label} to={row.to} className={className}>
                {content}
              </Link>
            ) : (
              <div key={row.label} className={className}>
                {content}
              </div>
            );
          })}
        </section>

        {(isRestaurant || isAdmin) && (
          <Link
            to="/dashboard"
            className="block rounded-2xl border border-primary/20 bg-primary/5 py-4 text-center text-sm font-black text-primary"
          >
            الانتقال إلى لوحة التحكم
          </Link>
        )}

        {user && (
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-4 text-sm font-black text-discount"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function Shortcut({
  to,
  icon: Icon,
  label,
}: {
  to: "/orders" | "/favorites" | "/cart";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center text-xs font-black shadow-sm"
    >
      <span className="mb-2 grid size-10 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      {label}
    </Link>
  );
}
