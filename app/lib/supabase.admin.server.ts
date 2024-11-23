// Archivo: /app/lib/supabase.admin.server.ts
import { createServerClient } from '@supabase/auth-helpers-remix';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database';

if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL es requerida');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY es requerida');
}

export const createAdminSupabase = () => {
    return createClient<Database>(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
};