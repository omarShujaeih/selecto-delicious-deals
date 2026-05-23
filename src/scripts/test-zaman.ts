import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const email = "zaman@example.com";
const password = "OmarSelecto2026";

async function run() {
  console.log("Creating supabase client...");
  const supabase = createClient(supabaseUrl!, supabaseKey!, {
    auth: { persistSession: false }
  });
  console.log("Calling signInWithPassword...");
  try {
    const res = await supabase.auth.signInWithPassword({ email, password });
    console.log("Result:", JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error("Caught error:", err);
  }
}

run();
