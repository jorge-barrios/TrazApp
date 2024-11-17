// Archivo: /app/components/layouts/ProtectedLayout.tsx

import { FC, ReactNode } from 'react';
import { Outlet, useNavigate } from '@remix-run/react';
import { useEffect } from 'react';
import { createServerSupabase } from "~/lib/supabase.server";

interface ProtectedLayoutProps {
  children?: ReactNode;
}

const ProtectedLayout: FC<ProtectedLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const response = new Response();
      const supabase = createServerSupabase(request, response);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Aquí irá el header y navegación común */}
      <main>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default ProtectedLayout;