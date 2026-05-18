import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Settings as Gear,
  User as UserIcon,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Selecto" },
      { name: "description", content: "Manage your Selecto account, addresses, and preferences." },
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
  return (
    <div className="phone-frame flex flex-col">
      <header className="bg-gradient-to-br from-primary to-primary-glow px-5 pb-12 pt-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <button className="grid size-9 place-items-center rounded-full bg-white/15" aria-label="Back">
            <ChevronRight className="size-4 rotate-180" />
          </button>
          <button className="grid size-9 place-items-center rounded-full bg-white/15" aria-label="Settings">
            <Gear className="size-4" />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-full bg-white/20 text-2xl font-extrabold">
            S
          </div>
          <div>
            <p className="text-xs opacity-80">Welcome back,</p>
            <h1 className="font-display text-xl font-extrabold">Sarah Johnson</h1>
            <p className="text-xs opacity-80">sarah.johnson@email.com</p>
            <span className="mt-1 inline-block rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              Gold Member
            </span>
          </div>
        </div>
      </header>

      <main className="-mt-6 flex-1 space-y-2 px-4">
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

        <Link
          to="/dashboard"
          className="block rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-primary shadow-card"
        >
          Switch to Restaurant / Admin
        </Link>

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-bold text-discount">
          <LogOut className="size-4" /> Log Out
        </button>
      </main>

      <div className="mt-6">
        <BottomNav />
      </div>
    </div>
  );
}
