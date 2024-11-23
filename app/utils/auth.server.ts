// app/utils/auth.server.ts
import { redirect } from "@remix-run/node";
import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '~/types/database.types';

export const getAuthenticatedUser = async (request: Request) => {
  const response = new Response();
  
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error al obtener usuario autenticado:', error);
    return { user: null, error };
  }

  return { user, error: null };
};

export const validateSession = async (request: Request) => {
  const { user, error } = await getAuthenticatedUser(request);
  
  if (error || !user) {
    throw new Response('No autorizado', { status: 401 });
  }
  
  return user;
};

export async function requireAuth(request: Request) {
  const response = new Response();
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw redirect("/login", { 
      headers: response.headers 
    });
  }

  return { 
    supabase, 
    response,
    session 
  };
}

export async function getUser(request: Request) {
  const response = new Response();
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
}

export async function requireAdmin(request: Request) {
  const response = new Response();
  
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw redirect('/login', {
      headers: response.headers,
    });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('access_level')
    .eq('user_id', session.user.id)
    .single();

  if (!profile || profile.access_level !== 'admin') {
    throw redirect('/', {
      headers: response.headers,
    });
  }

  return { supabase, response };
}

export async function getProfile(request: Request) {
  const { supabase, session, response } = await requireAuth(request);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("active", true)
    .single();

  if (error || !profile) {
    throw redirect("/login", {
      headers: response.headers
    });
  }

  return { profile, response };
}

export async function createUserProfile(
  supabase: any, 
  userData: { 
    email: string; 
    password: string; 
    full_name: string; 
    role: string; 
    access_level: string;
    node_id: string;
  }
) {
  // Primero crear el usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true
  });

  if (authError) throw authError;

  // Luego crear el perfil asociado
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        user_id: authData.user.id,
        full_name: userData.full_name,
        role: userData.role,
        access_level: userData.access_level,
        node_id: userData.node_id,
        active: true
      }
    ])
    .select()
    .single();

  if (profileError) {
    // Si hay error al crear el perfil, eliminar el usuario creado
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw profileError;
  }

  return { user: authData.user, profile: profileData };
}

export async function updateUserProfile(
  supabase: any,
  userId: string,
  userData: {
    full_name?: string;
    role?: string;
    access_level?: string;
    node_id?: string;
    active?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUser(supabase: any, userId: string) {
  // Primero desactivar el perfil
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ active: false })
    .eq('user_id', userId);

  if (profileError) throw profileError;

  // Luego eliminar el usuario de Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) throw authError;

  return true;
}