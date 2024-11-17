import { useState, useEffect, useCallback } from 'react';
import { useAuthUser } from '~/hooks/useAuthUser';
import { supabase } from '~/supabaseClient';

export default function LoginButton() {
  const { refreshUser } = useAuthUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      if (data) await refreshUser();
      
    } catch (err) {
      console.error('Error en login:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [origin, refreshUser]);

  return (
    <>
      <button 
        onClick={handleLogin} 
        disabled={isLoading || !origin}
        className="login-button"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
      {error && (
        <div className="error-message">
          {error.message}
        </div>
      )}
    </>
  );
}
