
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.REACT_APP_SUPABASE_UR;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KE;
console.log(supabaseUrl,supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey)