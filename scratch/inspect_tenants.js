const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sfznhehpxbcgsjzbgbpd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmem5oZWhweGJjZ3NqemJnYnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTkzNTQsImV4cCI6MjA5NTA3NTM1NH0.IjlmJkJJMp9G2uHHkXDdBimEMJT17OZ3cuGlbRocrQg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  try {
    console.log('--- FETCHING ALL PROFILES ---');
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*');
    
    if (pError) console.error('Profiles Error:', pError);
    else console.log(`Found ${profiles.length} profiles:`, profiles);

    console.log('\n--- FETCHING ALL TENANT PROFILES ---');
    const { data: tenantProfiles, error: tpError } = await supabase
      .from('tenant_profiles')
      .select('*');
    
    if (tpError) console.error('Tenant Profiles Error:', tpError);
    else console.log(`Found ${tenantProfiles.length} tenant profiles:`, tenantProfiles);

    console.log('\n--- FETCHING ALL CONTRACTS ---');
    const { data: contracts, error: cError } = await supabase
      .from('contracts')
      .select('*');
    
    if (cError) console.error('Contracts Error:', cError);
    else console.log(`Found ${contracts.length} contracts:`, contracts);

  } catch (err) {
    console.error('Inspection failed:', err);
  }
}

inspect();
