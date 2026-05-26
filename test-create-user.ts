import "dotenv/config";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function test() {
  const phone = "0591234567";
  const password = "Password123!";
  const fullName = "Omar Test";
  
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      phone: phone,
      password: password,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });
    
  console.log("data:", userData);
  console.log("error:", createError);
}

test();
