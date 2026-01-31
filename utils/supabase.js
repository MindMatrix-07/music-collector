require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Supabase credentials missing from .env');
    process.exit(1);
}

// Initialize Supabase client with Service Role Key (Admin Access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
