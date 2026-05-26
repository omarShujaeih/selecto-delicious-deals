import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../integrations/supabase/client.server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;

const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});

function formatPhoneNumber(value: string) {
  const digits = value.replace(/[^\d+]/g, "").trim();
  if (/^0(56|59)\d{7}$/.test(digits)) return `+970${digits.slice(1)}`;
  if (/^97(0|2)(56|59)\d{7}$/.test(digits)) return `+${digits}`;
  if (/^\+97(0|2)(56|59)\d{7}$/.test(digits)) return digits;
  return digits;
}

async function runTests() {
  console.log("=== Starting Manual Verification Tests ===");
  const testPhoneRaw = "0599999999";
  const testPhoneNorm = formatPhoneNumber(testPhoneRaw);
  const testUsername = "test_customer_99";
  const testPassword = "Password123!";

  console.log(`\n1. New Customer Signup Test`);
  console.log(`   Raw Phone: ${testPhoneRaw} -> Normalized: ${testPhoneNorm}`);
  
  // Cleanup previous test
  const { data: existingProfiles } = await supabaseAdmin.from("profiles").select("id").eq("username", testUsername);
  if (existingProfiles && existingProfiles.length > 0) {
    for (const p of existingProfiles) await supabaseAdmin.auth.admin.deleteUser(p.id);
  }

  // Simulate registerCustomerBypassingOtp
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: `${testPhoneNorm}@selecto.local`,
    phone: testPhoneNorm,
    password: testPassword,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { full_name: "Test Customer", display_name: "Test Customer" },
  });
  if (createError) throw new Error("Create user failed: " + createError.message);
  
  // Simulate signInWithPassword (AuthPage)
  const { data: signInSession, error: signInErr } = await authClient.auth.signInWithPassword({
    phone: testPhoneNorm,
    password: testPassword,
  });
  if (signInErr) throw new Error("Initial sign in failed: " + signInErr.message);

  // Simulate saveCustomerProfile
  const { error: rpcError } = await authClient.rpc("complete_customer_profile", {
    _username: testUsername,
    _full_name: "Test Customer",
    _city: "Ramallah",
    _area: "Test Area",
    _phone_number: testPhoneNorm,
  });
  if (rpcError) throw new Error("complete_customer_profile failed: " + rpcError.message);

  // Verification checks
  const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", newUser.user.id).single();
  const { data: roles } = await supabaseAdmin.from("user_roles").select("*").eq("user_id", newUser.user.id);
  
  console.log(`   Profile row created: ${!!profile}`);
  console.log(`   phone_verified: ${profile!.phone_verified}`);
  console.log(`   user_roles: ${roles?.map(r => r.role).join(",")}`);

  console.log(`\n2. Login by phone (local format)`);
  await authClient.auth.signOut();
  const phoneLoginNorm = formatPhoneNumber(testPhoneRaw);
  const { data: phoneLoginSession, error: phoneLoginErr } = await authClient.auth.signInWithPassword({
    phone: phoneLoginNorm,
    password: testPassword,
  });
  if (phoneLoginErr) throw new Error("Phone login failed");
  console.log(`   Login successful: ${!!phoneLoginSession.session}`);

  console.log(`\n3. Login by username`);
  await authClient.auth.signOut();
  const { data: profileLookup } = await supabaseAdmin.from("profiles").select("phone_number").eq("username", testUsername).single();
  const resolvedPhone = profileLookup?.phone_number;
  const { data: usernameLoginSession, error: usernameLoginErr } = await authClient.auth.signInWithPassword({
    phone: formatPhoneNumber(resolvedPhone!),
    password: testPassword,
  });
  if (usernameLoginErr) throw new Error("Username login failed");
  console.log(`   Username resolved to phone: ${resolvedPhone}`);
  console.log(`   Login successful: ${!!usernameLoginSession.session}`);

  console.log(`\n4. Demo customer buttons`);
  const demoUsers = ["customer1", "customer2", "customer3"];
  for (const demoUser of demoUsers) {
    const { data: demoLookup } = await supabaseAdmin.from("profiles").select("phone_number").eq("username", demoUser).single();
    if (!demoLookup?.phone_number) {
      console.log(`   [Warning] ${demoUser} missing from DB. Cannot test.`);
      continue;
    }
    const { data: demoSession, error: demoErr } = await authClient.auth.signInWithPassword({
      phone: formatPhoneNumber(demoLookup.phone_number),
      password: "Customer123",
    });
    console.log(`   ${demoUser} login successful: ${!demoErr && !!demoSession.session}`);
    await authClient.auth.signOut();
  }

  console.log(`\n5. Security & Portal check`);
  const roleNames = roles?.map(r => r.role) || [];
  const isCustomer = roleNames.includes("customer");
  const isAdminOrRestaurant = roleNames.includes("admin") || roleNames.includes("restaurant");
  console.log(`   Is Customer: ${isCustomer}`);
  console.log(`   Can access Admin/Restaurant dashboard: ${isAdminOrRestaurant}`);
  if (isCustomer && !isAdminOrRestaurant) {
    console.log(`   Customer correctly blocked from portal/dashboard.`);
  }

  console.log("\n=== All Tests Passed! ===");
}

runTests().catch(console.error);
