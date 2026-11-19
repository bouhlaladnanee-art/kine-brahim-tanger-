// Configuration Supabase - Remplace firebase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url'
);

let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    });
    console.log('✅ Supabase initialisé avec succès :', supabaseUrl);
  } catch (error) {
    console.warn("Erreur d'initialisation Supabase, bascule sur le mode local :", error);
  }
} else {
  console.info('ℹ️ Clés Supabase non configurées dans .env. L\'application fonctionne en mode local persistant.');
}

export { supabase };
