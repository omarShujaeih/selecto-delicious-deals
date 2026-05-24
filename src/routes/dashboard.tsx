import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { BarChart3, LayoutDashboard, ListChecks, PlusCircle, Shield, Store, ShoppingBag, Settings } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

import React from "react";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-red-500 font-mono text-xs whitespace-pre-wrap">CRASH DASHBOARD: {this.state.error?.message}{'\n'}{this.state.error?.stack}</div>;
    }
    return this.props.children;
  }
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Selecto" },
      { name: "description", content: "Restaurant and admin tools for Selecto." },
    ],
  }),
  component: () => <ErrorBoundary><DashboardLayout /></ErrorBoundary>,
});

const restaurantNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/offers", label: "My Menu", icon: ListChecks },
  { to: "/dashboard/offers/new", label: "Add Item", icon: PlusCircle },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminNav = [
  { to: "/dashboard/admin", label: "Admin", icon: Shield, exact: true },
  { to: "/dashboard/admin/restaurants", label: "Restaurants", icon: Store },
  { to: "/dashboard/admin/offers", label: "Menu Items", icon: ListChecks },
];

function DashboardLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, loading, isAdmin, isRestaurant, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav({ to: "/auth" });
      return;
    }
    if (!isAdmin && !isRestaurant) {
      nav({ to: "/offers" });
      return;
    }
    // Block non-admin from admin sub-routes
    if (!isAdmin && loc.pathname.startsWith("/dashboard/admin")) {
      nav({ to: "/dashboard" });
      return;
    }
    // Auto-redirect admin to admin dashboard when landing on base /dashboard
    if (isAdmin && !isRestaurant && loc.pathname === "/dashboard") {
      nav({ to: "/dashboard/admin" });
    }
  }, [user, loading, nav, isAdmin, isRestaurant, loc.pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? loc.pathname === to : loc.pathname.startsWith(to);

  if (loading) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!user) return null;

  if (!isAdmin && loc.pathname.startsWith("/dashboard/admin")) {
    return null;
  }

  if (!isAdmin && !isRestaurant) {
    return (
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
        <div className="space-y-3">
          <h1 className="font-display text-xl font-extrabold">No dashboard access</h1>
          <p className="text-sm text-muted-foreground">
            Your account doesn't have a restaurant or admin role. Sign up as a restaurant to manage offers.
          </p>
          <Link to="/offers" className="inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Back to offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-0 px-4 py-6 lg:flex-row lg:gap-6">
      <aside className="mb-4 shrink-0 rounded-2xl bg-card p-4 shadow-card lg:mb-0 lg:w-60 lg:self-start">
        <div className="flex items-center gap-2 px-1 pb-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-extrabold">S</div>
          <div>
            <p className="text-sm font-bold">Selecto</p>
            <p className="text-[10px] text-muted-foreground">{isAdmin ? "Admin console" : "Restaurant"}</p>
          </div>
        </div>
        <nav className="space-y-3">
          {isRestaurant && <NavGroup title="Restaurant" items={restaurantNav} isActive={isActive} />}
          {isAdmin && <NavGroup title="Admin" items={adminNav} isActive={isActive} />}
        </nav>
        <button
          onClick={signOut}
          className="mt-6 block w-full rounded-xl border border-border px-3 py-2 text-center text-xs font-bold text-destructive hover:bg-destructive/10"
        >
          تسجيل الخروج (Sign Out)
        </button>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean };

function NavGroup({
  title,
  items,
  isActive,
}: {
  title: string;
  items: readonly NavItem[];
  isActive: (to: string, exact?: boolean) => boolean;
}) {
  return (
    <div>
      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
        {items.map((it) => {
          const active = isActive(it.to, it.exact);
          return (
            <li key={it.to} className="shrink-0">
              <Link
                to={it.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                  }`}
              >
                <it.icon className="size-4" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
