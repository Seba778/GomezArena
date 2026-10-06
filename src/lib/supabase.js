import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvresxffmbeiqgpzdzbrk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cmVzeGZmbWJlaXFncHpkYnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Njc5ODYsImV4cCI6MjEwNjQ0Mzk4Nn0.IStw1z8LqrpMDRthM_KUnZRTpONxx9vH8ILkZPOLDOk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
