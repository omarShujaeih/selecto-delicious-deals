import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Selecto" },
      { name: "description", content: "Manage your Selecto account." },
    ],
  }),
  component: ProfilePage,
});

const rows = [
  { icon: UserIcon, label: "My Account" },
  { icon: MapPin, label: "Addresses" },
  { icon: CreditCard, label: "Payment Methods" },
  { icon: Bell, label: "Notifications" },
  { icon: HelpCircle, label: "Help & Support" },
  { icon: Settings, label: "Settings" },
];

function ProfilePage() {
  const { user, roles, signOut, isAdmin, isRestaurant } = useAuth();
  const nav = useNavigate();
  const name = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "Guest";
  const roleLabel = isAdmin ? "Admin" : isRestaurant ? "Restaurant" : roles.length ? "Customer" : "Guest";

  return (
    <div className="phone-frame flex flex-col">
      <header className="bg-gradient-to-br from-primary to-primary-glow px-5 pb-12 pt-6 text-primary-foreground">
        <div className="mt-2 flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-full bg-white/20 text-2xl font-extrabold uppercase">
            {name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-xs opacity-80">Welcome{user ? " back," : ","}</p>
            <h1 className="font-display text-xl font-extrabold truncate">{name}</h1>
            <p className="truncate text-xs opacity-80">{user?.email ?? "Browsing as guest"}</p>
            <span className="mt-1 inline-block rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              {roleLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="-mt-6 flex-1 space-y-2 px-4">
        {!user && (
          <Link
            to="/auth"
            className="block rounded-2xl bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground shadow-card"
          >
            Sign in or create account
          </Link>
        )}

        <div className="rounded-2xl bg-card shadow-card">
          {rows.map((r, i) => (
            <button
              key={r.label}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm ${
                i !== rows.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                <r.icon className="size-4" />
              </span>
              <span className="flex-1 font-medium">{r.label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {(isRestaurant || isAdmin) && (
          <Link
            to="/dashboard"
            className="block rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-primary shadow-card"
          >
            Open {isAdmin ? "Admin" : "Restaurant"} Dashboard
          </Link>
        )}

        {user && (
          <button
            onClick={async () => {
              await signOut();
              nav({ to: "/" });
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-bold text-discount"
          >
            <LogOut className="size-4" /> Log Out
          </button>
        )}
      </main>

      <div className="mt-6">
        <BottomNav />
      </div>
    </div>
  );
}
