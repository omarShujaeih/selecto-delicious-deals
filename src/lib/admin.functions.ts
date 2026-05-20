import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CreateRestaurantInput = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  display_name: z.string().min(1).max(120),
  restaurant_name: z.string().min(1).max(120),
  cuisine: z.string().min(1).max(80),
  city: z.string().min(1).max(80).default("Ramallah"),
});

export const adminCreateRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateRestaurantInput.parse(input))
  .handler(async ({ data, context }) => {
    // Verify caller is admin via authed client (RLS-backed has_role).
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden: admin only");

    // Create auth user (auto-confirmed) using service role.
    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.display_name },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Failed to create user");
    }
    const uid = created.data.user.id;

    // Ensure profile (trigger usually does this, but make it idempotent).
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: uid, display_name: data.display_name }, { onConflict: "id" });

    // Replace default 'customer' role with 'restaurant'.
    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    const { error: roleInsertErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: "restaurant" });
    if (roleInsertErr) throw new Error(roleInsertErr.message);

    // Create the restaurant row owned by this user.
    const { data: restaurant, error: restErr } = await supabaseAdmin
      .from("restaurants")
      .insert({
        owner_id: uid,
        name: data.restaurant_name,
        cuisine: data.cuisine,
        city: data.city,
        active: true,
      })
      .select()
      .single();
    if (restErr) throw new Error(restErr.message);

    return { user_id: uid, restaurant };
  });
