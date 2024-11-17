import { useAuthUser } from '~/hooks/useAuthUser';
import { useState } from 'react';
import { supabase } from '~/supabaseClient';

export default function LogoutButton() {
  const { refreshUser } = useAuthUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await refreshUser();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Intentar actualizar el estado del usuario de todos modos
      await refreshUser();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
    </button>
  );
}
