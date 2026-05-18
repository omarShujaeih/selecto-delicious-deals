import { createFileRoute, Link } from "@tanstack/react-router";
import { DollarSign, Package, Store, TrendingUp, Users } from "lucide-react";
import { adminStats, reports } from "@/lib/sample-data";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminOverview,
});

function AdminOverview() {
  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-extrabold">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>
        <Link to="/dashboard/admin/restaurants" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-card">
          Manage restaurants
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={Users} label="Users" value={adminStats.users.toLocaleString()} delta="+13.5%" />
        <Stat icon={Store} label="Restaurants" value={adminStats.restaurants.toLocaleString()} delta="+9.3%" />
        <Stat icon={Package} label="Offers" value={adminStats.offers.toLocaleString()} delta="+15.7%" />
        <Stat icon={DollarSign} label="Revenue" value={`$${adminStats.revenue.toLocaleString()}`} delta="+18.6%" />
        <Stat icon={TrendingUp} label="Commission" value={`$${adminStats.commission.toLocaleString()}`} delta="+16.4%" />
      </div>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="mb-3 text-sm font-bold">Reports & Notifications</h2>
        <ul className="divide-y divide-border">
          {reports.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-[11px] text-muted-foreground">{r.date}</p>
              </div>
              <button className="text-xs font-semibold text-primary">View</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="mb-2 grid size-9 place-items-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" />
      </div>
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-success">{delta}</p>
    </div>
  );
}
