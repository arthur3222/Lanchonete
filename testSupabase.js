import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mihtxdlmllntfxkclkvis.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paHR4ZGxtbG50ZnhrY2xrdmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQ4MzksImV4cCI6MjA3NDk5MDgzOX0.oqMeEOnV5463hF8BaJ916yYyNjDC2bJe73SCP2Fg1yA';

export async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Testa conexão básica
    const { data, error } = await supabase.from('usuarios').select('count');
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('Connection test successful!', data);
    return true;
  } catch (e) {
    console.error('Connection test exception:', e);
    return false;
  }
}
