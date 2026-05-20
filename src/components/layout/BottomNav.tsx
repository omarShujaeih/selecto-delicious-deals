import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShoppingCart, ClipboardList, Heart, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const items = [
  { to: "/offers", label: "Home", icon: Home },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="sticky bottom-0 z-30 mt-auto bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="grid grid-cols-5 max-w-lg mx-auto w-full relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-border" />
        {items.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname.startsWith(to);
          return (
            <li key={to} className="relative">
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary rounded-b-full z-10" />
              )}
              <Link
                to={to}
                className={`relative flex flex-col items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`size-[22px] ${active ? "stroke-[2.5]" : "stroke-2"}`}
                    aria-hidden
                  />
                  {to === "/cart" && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                      {totalItems}
                    </span>
                  )}
                </div>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
