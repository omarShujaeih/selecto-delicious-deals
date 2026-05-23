import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// read supabase url and anon key from .env
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const emails = ['omar@example.com', 'zaman@example.com', 'burgers@example.com', 'customer@example.com'];
  
  // We need service role key to query auth.users, or we can just query user_roles which might have email?
  // Let's sign in as each user to get their ID, then check their roles
  for (const email of emails) {
    console.log(`\n--- Checking ${email} ---`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: 'OmarSelecto2026'
    });
    
    if (authError) {
      console.log('Login failed:', authError.message);
      continue;
    }
    
    const userId = authData.user.id;
    console.log('User ID:', userId);
    
    // Call get_my_roles
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_roles');
    console.log('get_my_roles rpc result:', rpcData, rpcError ? rpcError.message : '');

    // Directly query user_roles
    const { data: rolesData, error: rolesError } = await supabase.from('user_roles').select('*').eq('user_id', userId);
    console.log('user_roles table result:', rolesData, rolesError ? rolesError.message : '');
    
    await supabase.auth.signOut();
  }
}

check();
