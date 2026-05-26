import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/shared/ui/sonner";
import { AuthProvider } from "@/features/auth/auth.context";
import { CartProvider } from "@/features/cart/cart.context";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { PushNotifications } from "@capacitor/push-notifications";
import { savePushToken } from "@/features/auth/account.functions";

function NotFoundComponent() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-7xl font-black text-primary">404</h1>
        <h2 className="mt-4 text-xl font-black text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          الرابط غير صحيح أو تم نقل الصفحة.
        </p>
        <Link
          to="/offers"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-card"
        >
          العودة للعروض
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent() {
  const router = useRouter();

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-2xl font-black text-foreground">تعذر تحميل الصفحة</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          حدث خطأ مؤقت. جرب التحديث أو ارجع للعروض.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => router.invalidate()}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"
          >
            إعادة المحاولة
          </button>
          <Link
            to="/offers"
            className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-black text-foreground"
          >
            العروض
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#123f32" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Selecto" },
      { title: "Selecto | عروض المطاعم" },
      {
        name: "description",
        content: "اكتشف عروض يومية على وجبات مختارة من مطاعم محلية قريبة منك.",
      },
      { property: "og:title", content: "Selecto | عروض المطاعم" },
      { property: "og:description", content: "عروض يومية من مطاعم محلية على Selecto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icons/selecto-icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/icons/selecto-icon.svg" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: () => {
    if (typeof window !== "undefined" && window.location.search.includes("reset=1")) {
      localStorage.clear();
      window.location.href = window.location.pathname;
      return null;
    }

    return <RootComponent />;
  },
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <PwaRegistration />
          <CapacitorRegistration />
          <Outlet />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("[PWA] Service worker registration failed:", error);
    });
  }, []);
  return null;
}

function CapacitorRegistration() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initNative = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0A432A" });
      } catch (e) {
        // Ignored on web
      }

      try {
        await SplashScreen.hide();
      } catch (e) {
        // Ignored on web
      }

      try {
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack || window.history.length > 1) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      } catch (e) {
        // Ignored on web
      }

      try {
        // Push Notifications Setup
        const permStatus = await PushNotifications.requestPermissions();
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
        }

        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          try {
            await savePushToken({ data: { token: token.value } });
          } catch (e) {
            console.warn("Failed to save push token to server", e);
          }
        });

      } catch (e) {
        // Ignored on web or devices without Google Play Services
      }
    };

    initNative();
  }, [router]);

  return null;
}
