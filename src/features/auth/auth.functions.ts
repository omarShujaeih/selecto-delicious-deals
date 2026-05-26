import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

const authClient = createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

function formatPhoneNumber(value: string) {
  const digits = value.replace(/[^\d+]/g, "").trim();

  if (/^0(56|59)\d{7}$/.test(digits)) return `+970${digits.slice(1)}`;
  if (/^97(0|2)(56|59)\d{7}$/.test(digits)) return `+${digits}`;
  if (/^\+97(0|2)(56|59)\d{7}$/.test(digits)) return digits;

  // Fallback behavior or un-formatted local behavior
  return digits;
}

export const customerPhonePasswordLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ phone: z.string().min(1), password: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }) => {
    const formattedPhone = formatPhoneNumber(data.phone);

    const { data: sessionData, error } = await authClient.auth.signInWithPassword({
      phone: formattedPhone,
      password: data.password,
    });
    if (error) {
      console.error("[Auth] Phone login failed:", error.message);
      throw new Error("Invalid login credentials");
    }
    return sessionData.session;
  });

  export const customerUsernamePasswordLogin = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) =>
      z.object({ username: z.string().min(1), password: z.string().min(1) }).parse(input)
    )
    .handler(async ({ data }) => {
      const username = normalizeUsername(data.username);

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, phone_number")
        .ilike("username", username)
        .maybeSingle();

      if (profileError || !profile) {
        console.error("[Auth] Username lookup failed:", profileError?.message);
        throw new Error("Invalid login credentials");
      }

      const { data: roles, error: rolesError } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", profile.id);

      if (rolesError) {
        console.error("[Auth] Username role lookup failed:", rolesError.message);
        throw new Error("Invalid login credentials");
      }

      const roleNames = (roles ?? []).map((row) => row.role);
      if (!roleNames.includes("customer") || roleNames.includes("admin") || roleNames.includes("restaurant")) {
        throw new Error("Invalid login credentials");
      }

      let phone = profile.phone_number;
      if (!phone) {
        const authUser = await supabaseAdmin.auth.admin.getUserById(profile.id);
        if (authUser.error) {
          console.error("[Auth] Username auth user lookup failed:", authUser.error.message);
          throw new Error("Invalid login credentials");
        }
        phone = authUser.data.user?.phone ?? null;
      }

      if (!phone) {
        throw new Error("Invalid login credentials");
      }

      const formattedPhone = formatPhoneNumber(phone);

      const { data: signedIn, error: signInError } = await authClient.auth.signInWithPassword({
        phone: formattedPhone,
        password: data.password,
      });

      if (signInError || !signedIn.session) {
        console.error("[Auth] Username password sign-in failed:", signInError?.message);
        throw new Error("Invalid login credentials");
      }

      return {
        access_token: signedIn.session.access_token,
        refresh_token: signedIn.session.refresh_token,
      };
    });

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export const registerCustomerBypassingOtp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      phone: z.string().min(1),
      password: z.string().min(6),
      fullName: z.string().min(1),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const formattedPhone = formatPhoneNumber(data.phone);

    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: `${formattedPhone}@selecto.local`,
      phone: formattedPhone,
      password: data.password,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        display_name: data.fullName,
        full_name: data.fullName,
      },
    });

    if (createError) {
      console.error("[Auth] Bypassed OTP user creation failed:", createError.message);
      throw new Error(createError.message);
    }

    return { success: true };
  });

export const checkUsernameAvailable = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.string().parse(input))
  .handler(async ({ data: username }) => {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", normalizeUsername(username))
      .maybeSingle();
      
    if (error) {
      console.error("[Auth] Username check failed:", error.message);
      return false; 
    }
    
    return !data; 
  });
