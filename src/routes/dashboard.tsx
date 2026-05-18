import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { BarChart3, LayoutDashboard, ListChecks, PlusCircle, Shield, Store } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Selecto" },
      { name: "description", content: "Restaurant and admin tools for Selecto." },
    ],
  }),
  component: DashboardLayout,
});

const restaurantNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/offers", label: "Offers", icon: ListChecks },
  { to: "/dashboard/offers/new", label: "Add Offer", icon: PlusCircle },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const adminNav = [
  { to: "/dashboard/admin", label: "Admin", icon: Shield },
  { to: "/dashboard/admin/restaurants", label: "Restaurants", icon: Store },
];

function DashboardLayout() {
  const loc = useLocation();
  const isActive = (to: string, exact?: boolean) =>
    exact ? loc.pathname === to : loc.pathname.startsWith(to);

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-0 px-4 py-6 lg:flex-row lg:gap-6">
      <aside className="mb-4 shrink-0 rounded-2xl bg-card p-4 shadow-card lg:mb-0 lg:w-60 lg:self-start">
        <div className="flex items-center gap-2 px-1 pb-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-extrabold">
            S
          </div>
          <div>
            <p className="text-sm font-bold">Selecto</p>
            <p className="text-[10px] text-muted-foreground">Restaurant & Admin</p>
          </div>
        </div>
        <nav className="space-y-3">
          <NavGroup title="Restaurant" items={restaurantNav} isActive={isActive} />
          <NavGroup title="Admin" items={adminNav} isActive={isActive} />
        </nav>
        <Link
          to="/offers"
          className="mt-4 block rounded-xl border border-border px-3 py-2 text-center text-xs font-semibold text-muted-foreground hover:bg-secondary"
        >
          ← Back to customer app
        </Link>
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
      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
        {items.map((it) => {
          const active = isActive(it.to, it.exact);
          return (
            <li key={it.to} className="shrink-0">
              <Link
                to={it.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
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
