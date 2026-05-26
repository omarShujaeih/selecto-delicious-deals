import "dotenv/config";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function createCustomer() {
  const phone = "+970590000000";
  const password = "Password123!";
  const username = "selecto_customer";
  const fullName = "Selecto Customer";
  const city = "Ramallah";

  // Create auth user
  const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
    phone,
    password,
    phone_confirm: true,
    user_metadata: {
      display_name: fullName,
      full_name: fullName,
    },
  });

  if (createError) {
    console.error("Error creating user:", createError);
    return;
  }
  
  if (user?.user) {
      // Create profile
      const { data: profile, error: profileError } = await supabaseAdmin.rpc("complete_customer_profile", {
        _username: username,
        _full_name: fullName,
        _city: city,
        _area: "Al Masyoun",
        _phone_number: phone
      });
      
      if (profileError) {
          console.error("Error creating profile:", profileError);
      } else {
          console.log("Customer created successfully!");
          console.log("Username:", username);
          console.log("Password:", password);
      }
  }
}

createCustomer();
