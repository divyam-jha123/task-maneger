// Supabase Configuration
// Replace these with your Supabase project credentials
// Get them from: https://app.supabase.com -> Your Project -> Settings -> API

const SUPABASE_URL = 'https://tcmkopjmwucabhaslcne.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbWtvcGptd3VjYWJoYXNsY25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTIzMjksImV4cCI6MjA3OTg4ODMyOX0.QCoTB2kkshcTeOa3brUvPTF3HRyPj3gX_SuM2K6dLMU';

// Initialize Supabase client and make it globally accessible
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Initialize Supabase client
// The CDN exposes supabase as a global variable
(function initSupabase() {
    function tryInit() {
        // Check if supabase is available (could be window.supabase or just supabase)
        const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
        
        if (supabaseLib && typeof supabaseLib.createClient === 'function') {
            try {
                window.supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✅ Supabase client initialized successfully');
                console.log('📊 Supabase URL:', SUPABASE_URL);
            } catch (error) {
                console.error('❌ Error creating Supabase client:', error);
            }
        } else {
            // Retry if not loaded yet (max 20 retries = 2 seconds)
            if (typeof initSupabase.retries === 'undefined') {
                initSupabase.retries = 0;
            }
            if (initSupabase.retries < 20) {
                initSupabase.retries++;
                setTimeout(tryInit, 100);
            } else {
                console.error('❌ Supabase library failed to load. Check the CDN script.');
            }
        }
    }
    tryInit();
})();

