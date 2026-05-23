const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let supabaseUrl = '';
let supabaseKey = '';
const envContent = fs.readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=') || line.trim().startsWith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=')) supabaseKey = line.split('=')[1].trim();
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Step 1: Query all policies on profiles table using the REST API
  // We can't query pg_policies via supabase-js (it's a system view), so use rpc
  const { data, error } = await supabase.rpc('get_profiles_policies');
  if (error) {
    console.log('RPC not available, trying direct approach...');
    
    // Alternative: use the management API to check
    // Let's just try an unauthenticated query first
    const { data: anonData, error: anonErr } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(5);
    console.log('ANON query result:', anonErr ? anonErr.message : JSON.stringify(anonData));
    
    // Now login and try authenticated
    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
      email: 'admin@younghouse.vn', password: 'AdminPassword123'
    });
    if (authErr) { console.log('LOGIN FAILED:', authErr.message); return; }
    console.log('LOGIN OK');
    
    const { data: authData, error: authDataErr } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', auth.user.id)
      .single();
    console.log('AUTH query result:', authDataErr ? authDataErr.message : JSON.stringify(authData));
  } else {
    console.log('Policies:', JSON.stringify(data, null, 2));
  }
}

run();
