import { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase.client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar usuario actual
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error('Error al verificar usuario:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Verificar el usuario después de cualquier cambio de estado
          const { data: { user }, error } = await supabase.auth.getUser();
          if (!error && user) {
            setUser(user);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
