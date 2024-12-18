// @ts-ignore
export const config = {
  regions: ['iad1']
};

import { createServerClient } from '@supabase/auth-helpers-remix';
import { redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';

export const adminLoader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();

  // Verificar acceso a rutas de admin
  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    return redirect('/');
  }

  return null;
};
