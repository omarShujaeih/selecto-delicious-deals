import { createFileRoute } from "@tanstack/react-router";
import { Search, Star, Store } from "lucide-react";
import { useState } from "react";
import { adminRestaurants } from "@/lib/sample-data";

export const Route = createFileRoute("/dashboard/admin/restaurants")({
  component: ManageRestaurants,
});

function ManageRestaurants() {
  const [q, setQ] = useState("");
  const list = adminRestaurants.filter((r) =>
    r.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-extrabold">Manage Restaurants</h1>
      <div className="flex items-center gap-2 rounded-full bg-card px-3 py-2.5 shadow-card">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search restaurants…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <ul className="space-y-2">
        {list.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
              <Store className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{r.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {r.cuisine} · {r.city}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold">
                <Star className="size-3 fill-primary text-primary" /> {r.rating}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                r.active
                  ? "bg-success text-success-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {r.active ? "Active" : "Pending"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
