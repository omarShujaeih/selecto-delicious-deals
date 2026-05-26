import "dotenv/config";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

async function test() {
  const username = "newuser2026";
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("username", normalizeUsername(username))
    .maybeSingle();
    
  console.log("query data:", data);
  console.log("query error:", error);
  
  if (error) {
    console.error("[Auth] Username check failed:", error.message);
    console.log("isAvailable: false (error)");
    return;
  }
  
  console.log("isAvailable:", !data);
}

test();
