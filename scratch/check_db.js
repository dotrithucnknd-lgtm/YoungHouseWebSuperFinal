const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sfznhehpxbcgsjzbgbpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmem5oZWhweGJjZ3NqemJnYnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ5OTM1NCwiZXhwIjoyMDk1MDc1MzU0fQ.I5I7CZlbiBSlh0V1V-VqogebNQOxB44pTPE83vBXDVw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying database tables...');
  
  try {
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('maintenance_tickets')
      .select('*')
      .limit(1);
    
    if (ticketsError) {
      console.log('maintenance_tickets error:', ticketsError.message);
    } else {
      console.log('maintenance_tickets exists!', ticketsData);
    }
  } catch (e) {
    console.log('maintenance_tickets error thrown:', e.message);
  }

  try {
    const { data: requestsData, error: requestsError } = await supabase
      .from('maintenance_requests')
      .select('*')
      .limit(1);
    
    if (requestsError) {
      console.log('maintenance_requests error:', requestsError.message);
    } else {
      console.log('maintenance_requests exists!', requestsData);
    }
  } catch (e) {
    console.log('maintenance_requests error thrown:', e.message);
  }
}

run();
