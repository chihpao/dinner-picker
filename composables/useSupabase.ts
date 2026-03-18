import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseSingleton: SupabaseClient | null = null

export const useSupabase = () => {
    if (supabaseSingleton) return supabaseSingleton

    const SUPABASE_URL = 'https://ypszjizmmvoyxgkcvmzk.supabase.co'
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwc3pqaXptbXZveXhna2N2bXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTk2ODgsImV4cCI6MjA3OTE5NTY4OH0.z1nhCLgUs1OBQgAR6OTW_Xnq_I_v99im7e_E9dLkOUc'

    supabaseSingleton = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    })

    return supabaseSingleton
}
