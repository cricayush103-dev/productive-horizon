// ========================================
// PRODUCTIVE HORIZON - SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
    "https://rxescjlxgzxvhhpkgzoe.supabase.co";

// Apni copied Publishable Key yahan paste karo
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_h3gGOM4eaoWGakgqyjm0Pg_5pGaDu44";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client initialized successfully");