
import { createClient } from '@supabase/supabase-js';

// Direct Supabase URL - bypasses the agri-backend-plux proxy which causes CORS errors on production
const supabaseUrl = 'https://tqssenyemstlqpionqyp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3NlbnllbXN0bHFwaW9ucXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTk1NTUsImV4cCI6MjA4MzAzNTU1NX0.EYRRHALYoOSZb-w_zXch-mxvS66Upj00kCw_r-YdZf0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
