import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        confirmation: z.literal("DELETE_MY_ACCOUNT"),
      })
      .parse(input),
  )
  .handler(async ({ context }) => {
    const { data: roles, error: roleError } = await context.supabase.rpc("get_my_roles");
    if (roleError) throw new Error(roleError.message);

    const roleNames = (roles ?? []).map((row: any) => row.role);
    if (roleNames.includes("admin") || roleNames.includes("restaurant")) {
      throw new Error("Restaurant and admin accounts must contact Selecto support before deletion.");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) throw new Error(error.message);

    return { success: true };
  });

export const savePushToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ input, context }) => {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ fcm_token: input.token })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
