import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SplashScreen } from "@/components/ui/SplashScreen";
import { WelcomeScreen } from "@/components/ui/WelcomeScreen";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Selecto | عروض مطاعم قريبة" }] }),
  component: HomeEntry,
});

function HomeEntry() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, isAdmin, isRestaurant, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (showSplash || loading || (user && !rolesLoaded)) return;
    if (user) {
      navigate({ to: isAdmin || isRestaurant ? "/dashboard" : "/offers" });
    }
  }, [showSplash, loading, rolesLoaded, user, isAdmin, isRestaurant, navigate]);

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          sessionStorage.setItem("selecto_splash_seen", "1");
          setShowSplash(false);
        }}
      />
    );
  }

  if (loading || user) return <SplashScreen hold />;
  return <WelcomeScreen />;
}
