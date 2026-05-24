import { getSupabaseConfig } from "@/integrations/supabase/client";

type RestOptions = {
  accessToken?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export async function supabaseRest<T>(
  path: string,
  init: RequestInit = {},
  options: RestOptions = {},
): Promise<T> {
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = getSupabaseConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path.replace(/^\/+/, "")}`, {
      ...init,
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${options.accessToken ?? SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(body || `Supabase request failed (${response.status})`);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Supabase request timed out after ${options.timeoutMs ?? 8000}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
