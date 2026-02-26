// backend/lib/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;

// Public client (use this for normal queries)
const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);

// Admin client (use only for privileged operations like reading auth.users)
const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabase, supabaseAdmin };