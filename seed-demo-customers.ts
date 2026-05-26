import "dotenv/config";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

const demoCustomers = [
  {
    fullName: "زبون تجريبي 1",
    phone: "+970591111111",
    username: "customer1",
    password: "Customer123",
    city: "Ramallah"
  },
  {
    fullName: "زبون تجريبي 2",
    phone: "+970592222222",
    username: "customer2",
    password: "Customer123",
    city: "Nablus"
  },
  {
    fullName: "زبون تجريبي 3",
    phone: "+972593333333",
    username: "customer3",
    password: "Customer123",
    city: "Hebron"
  }
];

async function seedCustomers() {
  console.log("Seeding demo customers...");
  for (const customer of demoCustomers) {
    console.log(`Creating user: ${customer.username}`);

    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const isExists = existingUser.users.find(u => u.phone === customer.phone);
    let userId = isExists?.id;

    if (!isExists) {
        const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: `${customer.phone}@selecto.local`,
          phone: customer.phone,
          password: customer.password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            display_name: customer.fullName,
            full_name: customer.fullName,
          },
        });
      
        if (createError) {
          console.error(`Failed to create auth user for ${customer.username}:`, createError);
          continue;
        }
        
        userId = user.user.id;
    }

    if (userId) {
        // Manually update profiles and user_roles to skip RPC RLS issues
        await supabaseAdmin.from('profiles').upsert({
            id: userId,
            phone_number: customer.phone,
            username: customer.username,
            full_name: customer.fullName,
            display_name: customer.fullName,
            city: customer.city,
            phone_verified: true
        });

        await supabaseAdmin.from('user_roles').upsert({
            user_id: userId,
            role: 'customer'
        });
        
        console.log(`Successfully seeded ${customer.username}`);
    }
  }
  
  console.log("Seeding completed!");
}

seedCustomers();
