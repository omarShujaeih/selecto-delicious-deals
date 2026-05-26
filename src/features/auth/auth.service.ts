import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { supabaseRest } from "@/shared/lib/supabase-rest";

export type AppRole = "customer" | "restaurant" | "admin";
export type AuthStatus = "initializing" | "unauthenticated" | "authenticated" | "roleReady" | "roleError";

export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function fetchMyRoles(accessToken: string, signal?: AbortSignal): Promise<AppRole[]> {
  const rows = await supabaseRest<Array<{ role: AppRole }>>(
    "rpc/get_my_roles",
    {
      method: "POST",
      body: "{}",
    },
    {
      accessToken,
      signal,
      timeoutMs: 8000,
    },
  );

  return rows.map((row) => row.role);
}
