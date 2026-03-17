// Supabase Configuration
const SUPABASE_URL = 'https://sftumvgurjylpzpohqfo.supabase.co'; // Supabase Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdHVtdmd1cmp5bHB6cG9ocWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjU2NzYsImV4cCI6MjA3ODI0MTY3Nn0.xYwueusam4qPdKzeFr1Fb7uyLCl-jBryrNvF1vo7b6Y'; // Supabase anon public key

// Initialize Supabase client. The global `supabase` object is exposed by the CDN script.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabase = supabaseClient; 