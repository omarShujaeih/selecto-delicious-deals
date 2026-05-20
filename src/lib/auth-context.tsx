import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "restaurant" | "admin";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isRestaurant: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  roles: [],
  loading: true,
  isAdmin: false,
  isRestaurant: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        // defer to avoid deadlock
        setTimeout(() => loadRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });
    // Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadRoles(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRoles(_uid: string) {
    const { data } = await supabase.rpc("get_my_roles");
    setRoles((data ?? []).map((r: any) => r.role as AppRole));
  }

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      roles,
      loading,
      isAdmin: roles.includes("admin"),
      isRestaurant: roles.includes("restaurant"),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, roles, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

import { useRouter } from "@tanstack/react-router";
export function useCustomerGuard() {
  const { isAdmin, isRestaurant, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (loading) return;
    if (isAdmin || isRestaurant) {
      router.navigate({ to: "/dashboard" });
    }
  }, [isAdmin, isRestaurant, loading, router]);
}
