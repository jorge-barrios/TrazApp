// Archivo: /workspaces/TrazApp/app/lib/supabase.server.ts

import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '~/types/database';

export const createServerSupabase = (request: Request, response: Response) => {
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { 
      request, 
      response,
      options: {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    }
  );

  return supabase;
};

/* 
// Evita usar métodos como:
// const user = supabase.auth.user();
// const session = supabase.auth.session();

// En su lugar, usa:
// const { data: { user }, error } = await supabase.auth.getUser();
// ...manejo del error y uso del usuario autenticado...
*/