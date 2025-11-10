import { createClient } from '@supabase/supabase-js';

// Leia as variáveis de ambiente (Expo/React Native deve expor EXPO_PUBLIC_* para uso no app)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('your-project') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
  // aviso para desenvolvedor
  // eslint-disable-next-line no-console
  console.warn('[supabase] Variáveis de ambiente do Supabase não configuradas. Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helpers básicos para perfis
export async function upsertProfile(profile) {
  try {
    const { data, error } = await supabase.from('profiles').upsert(profile, { onConflict: 'email' }).select();
    if (error) throw error;
    return { data };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] upsertProfile error', e.message || e);
    return { error: e };
  }
}

export async function getProfileByEmail(email) {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('email', email).limit(1).single();
    if (error) return { error };
    return { data };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] getProfileByEmail error', e.message || e);
    return { error: e };
  }
}
