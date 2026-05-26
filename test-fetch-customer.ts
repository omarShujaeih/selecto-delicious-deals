import "dotenv/config";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function fetchLatestCustomer() {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  // Find a user who has a profile with a phone number and username
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .neq("username", null)
    .order("created_at", { ascending: false })
    .limit(5);
    
  console.log("Latest profiles with username:");
  console.log(profiles);
}

fetchLatestCustomer();
