const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sfznhehpxbcgsjzbgbpd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmem5oZWhweGJjZ3NqemJnYnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTkzNTQsImV4cCI6MjA5NTA3NTM1NH0.IjlmJkJJMp9G2uHHkXDdBimEMJT17OZ3cuGlbRocrQg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const profileId = 'ccf61515-6099-4685-af75-e8068b208bf1'; // Xuân Tùng id
  
  const { data, error } = await supabase
    .from('tenant_profiles')
    .insert({
      profile_id: profileId,
      id_card_number: '123456789',
      metadata: {
        email: 'test@example.com'
      }
    })
    .select();

  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Succeeded! Data:', data);
  }
}

testInsert();
