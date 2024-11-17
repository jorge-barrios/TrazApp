import { createClient } from '@/lib/supabase-browser';
const supabase = createClient();

export async function isUserAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !data) return false;
  
  return data.role === 'admin';
}

export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return profile;
}

export async function getUsersInNode(nodeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role, node_id')
      .eq('id', user.id)
      .single();

    // Solo permitir ver usuarios del mismo nodo
    if (adminProfile?.node_id !== nodeId) return [];

    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .eq('node_id', nodeId);

    return users || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function isSuperAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'superadmin';
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
