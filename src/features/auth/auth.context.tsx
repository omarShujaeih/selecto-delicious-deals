import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchMyRoles,
  getCurrentSession,
  type AppRole,
  type AuthStatus,
} from "@/features/auth/auth.service";

export type { AppRole, AuthStatus };

type AuthCtx = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  role: AppRole | null;
  status: AuthStatus;
  loading: boolean;
  loadingAuth: boolean;
  loadingRole: boolean;
  rolesLoaded: boolean;
  roleError: string | null;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
  isRestaurant: boolean;
  refreshRoles: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  roles: [],
  role: null,
  status: "initializing",
  loading: true,
  loadingAuth: true,
  loadingRole: false,
  rolesLoaded: false,
  roleError: null,
  isAuthenticated: false,
  isCustomer: false,
  isAdmin: false,
  isRestaurant: false,
  refreshRoles: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingRole, setLoadingRole] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const userId = session?.user?.id;
  const accessToken = session?.access_token;

  const fetchRoles = useCallback(async (isActive: () => boolean = () => true, signal?: AbortSignal) => {
    if (!userId || !accessToken) {
      if (isActive()) {
        setRoles([]);
        setRoleError(null);
        setRolesLoaded(true);
        setLoadingRole(false);
      }
      return;
    }

    setLoadingRole(true);
    setRolesLoaded(false);
    setRoleError(null);
    console.log("[AuthContext] fetchRoles started for user:", userId);

    try {
      const parsedRoles = await fetchMyRoles(accessToken, signal);

      if (isActive()) {
        setRoles(parsedRoles);
        if (parsedRoles.length === 0) {
          setRoleError("No role is assigned to this account. Please contact Selecto support.");
        }
      }
    } catch (err: any) {
      const message = err?.message ?? "Failed to load account roles.";
      console.error("[AuthContext] Error loading user roles:", message);
      if (isActive()) {
        setRoles([]);
        setRoleError(message);
      }
    } finally {
      if (isActive()) {
        setRolesLoaded(true);
        setLoadingRole(false);
      }
    }
  }, [userId, accessToken]);

  // 1. Handle Auth State
  useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        const s = await getCurrentSession();
        if (!active) return;
        setRoles([]);
        setRolesLoaded(false);
        setRoleError(null);
        setLoadingRole(!!s?.user);
        setSession(s);
        setLoadingAuth(false);
      } catch (err) {
        if (active) {
          setRolesLoaded(true);
          setLoadingAuth(false);
        }
      }
    }

    initAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      setRoles([]);
      setRolesLoaded(false);
      setRoleError(null);
      setLoadingRole(!!s?.user);
      setSession(s);
      setLoadingAuth(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 2. Handle Roles Fetching
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    fetchRoles(() => active, controller.signal);

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetchRoles]);

  const role = useMemo<AppRole | null>(() => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("restaurant")) return "restaurant";
    if (roles.includes("customer")) return "customer";
    return null;
  }, [roles]);

  const loading = loadingAuth || loadingRole;
  const isAuthenticated = !!session?.user;
  const isCustomer = role === "customer";
  const isAdmin = role === "admin";
  const isRestaurant = role === "restaurant";

  const status = loadingAuth
    ? "initializing"
    : !session?.user
      ? "unauthenticated"
      : loadingRole
        ? "authenticated"
        : roleError
          ? "roleError"
          : "roleReady";

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      roles,
      role,
      status,
      loading,
      loadingAuth,
      loadingRole,
      rolesLoaded,
      roleError,
      isAuthenticated,
      isCustomer,
      isAdmin,
      isRestaurant,
      refreshRoles: async () => {
        await fetchRoles();
      },
      signOut: async () => {
        console.log("[AuthContext] Sign out triggered. Clearing states...");
        setSession(null);
        setRoles([]);
        setRolesLoaded(true);
        setRoleError(null);
        setLoadingAuth(false);
        setLoadingRole(false);
        await supabase.auth.signOut();
        console.log("[AuthContext] Supabase sign out complete.");
      },
    }),
    [
      session,
      roles,
      role,
      status,
      loading,
      loadingAuth,
      loadingRole,
      rolesLoaded,
      roleError,
      isAuthenticated,
      isCustomer,
      isAdmin,
      isRestaurant,
      fetchRoles,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

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
