import { useState, useEffect } from 'react';
import { supabase } from '~/supabaseClient';
import type { User, AuthError } from '@supabase/supabase-js';

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | Error | null>(null);

  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null); // Resetear el error al inicio

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (session) {
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      const error = err as AuthError | Error;
      console.error('Error en refreshUser:', error);
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await refreshUser();
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, error, refreshUser };
}
