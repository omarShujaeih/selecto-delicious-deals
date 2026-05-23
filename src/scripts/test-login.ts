import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY!");
  process.exit(1);
}

const accounts = [
  { email: "omar@example.com", expectedRole: "admin" },
  { email: "zaman@example.com", expectedRole: "restaurant" },
  { email: "customer@example.com", expectedRole: "customer" },
];

const password = "OmarSelecto2026";

async function testLogins() {
  console.log("=== STARTING AUTH SIGNIN VERIFICATION ===");
  for (const account of accounts) {
    console.log(`\nTesting signin for: ${account.email}...`);
    // Create a new client per request to simulate clean session/headers
    const supabase = createClient(supabaseUrl!, supabaseKey!, {
      auth: { persistSession: false }
    });

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: password,
      });

      if (authError) {
        console.error(`❌ SIGNIN FAILED for ${account.email}:`, authError.message);
        continue;
      }

      console.log(`✅ SIGNIN SUCCESSFUL! UID: ${authData.user?.id}`);

      // Call the roles RPC function to verify role lookup
      const { data: roleRows, error: rpcError } = await supabase.rpc("get_my_roles");
      if (rpcError) {
        console.error(`❌ RPC 'get_my_roles' FAILED for ${account.email}:`, rpcError.message);
        continue;
      }

      const roles = (roleRows ?? []).map((r: any) => r.role);
      console.log(`✅ RPC 'get_my_roles' returned:`, roles);

      if (roles.includes(account.expectedRole)) {
        console.log(`🎉 SUCCESS: Found expected role '${account.expectedRole}'`);
      } else {
        console.warn(`⚠️ WARNING: Expected role '${account.expectedRole}' not found in user roles list:`, roles);
      }
    } catch (err: any) {
      console.error(`💥 EXCEPTION during test for ${account.email}:`, err.message || err);
    }
  }
  console.log("\n=== AUTH SIGNIN VERIFICATION COMPLETED ===");
}

testLogins();
