import "dotenv/config";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function test() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .limit(1);
    
  console.log("data:", data);
  console.log("error:", error);
}

test();
