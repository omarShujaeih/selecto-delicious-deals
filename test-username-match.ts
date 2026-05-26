import "dotenv/config";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function test() {
  const username = "omar2026";
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username")
    .ilike("username", username)
    .maybeSingle();
    
  console.log("query data:", data);
  console.log("query error:", error);
}

test();
