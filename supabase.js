// ========================================
// PRODUCTIVE HORIZON - SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
    "https://rxescjlxgzxvhhpkgzoe.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_h3gGOM4eaoWGakgqyjm0Pg_5pGaDu44";


// ========================================
// CHECK SUPABASE LIBRARY
// ========================================

if (
    typeof window.supabase === "undefined"
) {

    console.error(
        "Supabase library is not loaded."
    );

    window.supabaseLoadError = true;

}

else {

    window.supabaseLoadError = false;


    // ====================================
    // CREATE CLIENT
    // ====================================

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );


    console.log(
        "Supabase client initialized successfully"
    );
}
