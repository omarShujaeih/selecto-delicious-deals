import { Link, useLocation } from "@tanstack/react-router";
import { ClipboardList, Heart, Home, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/features/cart/cart.context";

const items = [
  { to: "/offers", label: "العروض", icon: Home },
  { to: "/cart", label: "السلة", icon: ShoppingCart },
  { to: "/orders", label: "طلباتي", icon: ClipboardList },
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/profile", label: "حسابي", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="selecto-bottom-nav safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[1200px] border-t border-border/80 bg-card/95 px-2 pt-1 shadow-[0_-10px_30px_rgba(18,63,50,0.08)] backdrop-blur">
      <ul className="mx-auto grid w-full max-w-lg grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/offers" ? loc.pathname === "/offers" || loc.pathname === "/" : loc.pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black transition ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className={`relative grid size-8 place-items-center rounded-xl ${active ? "bg-primary/10" : ""}`}>
                  <Icon className="size-5" />
                  {to === "/cart" && totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-discount text-[9px] font-black text-white">
                      {Math.min(totalItems, 9)}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
