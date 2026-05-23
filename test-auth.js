import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pvvbejnlqtvtjqztjqib.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zMGCYr4sT9yz8cCYm6Hmhg_8sJ8VpKM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log("Signing in...");
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: 'omar@example.com',
    password: 'OmarSelecto2026'
  });
  
  if (error) {
    console.error("Sign-in failed:", error.message);
    return;
  }
  
  console.log("Sign-in successful for:", authData.user.id);
  
  console.log("Fetching roles...");
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user.id);
    
  if (rolesError) {
    console.error("Roles fetch failed:", rolesError.message);
    return;
  }
  
  console.log("Roles fetched:", roles);
}

test();
