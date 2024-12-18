// Archivo: /app/routes/login.tsx
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { createServerSupabase } from "~/lib/supabase.server";
import { useTheme } from "~/hooks/useTheme";

import ThemeToggle from "~/components/login/ThemeToggle";
import Header from "~/components/login/Header";
import LoginForm from "~/components/login/LoginForm";

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error al obtener la sesión:', sessionError);
      return json(
        { error: null },
        { headers: response.headers }
      );
    }

    if (session) {
      return redirect("/dashboard", {
        headers: response.headers
      });
    }

    return json(
      { error: null },
      { headers: response.headers }
    );
  } catch (error) {
    console.error('Error inesperado:', error);
    return json(
      { error: null },
      { headers: response.headers }
    );
  }
};

export const action: ActionFunction = async ({ request }) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const formData = await request.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nodeId = formData.get("nodeId") as string;
  const rememberMe = formData.get("rememberMe") === "true";

  try {
    if (!nodeId) {
      return json(
        { error: "Debe seleccionar un tipo de centro e ingresar un identificador" },
        { headers: response.headers }
      );
    }

    // Buscar el nodo
    const { data: nodeData, error: nodeError } = await supabase
      .from('nodes')
      .select('id')
      .eq('node_id', nodeId)
      .single();

    if (nodeError || !nodeData) {
      return json(
        { error: "El centro seleccionado no existe" },
        { headers: response.headers }
      );
    }

    // Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return json(
        { error: "Las credenciales son incorrectas" },
        { headers: response.headers }
      );
    }

    // Actualizar perfil
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          node_id: nodeData.id,
          last_login: new Date().toISOString(),
          remember_me: rememberMe
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        return json(
          { error: "Error al actualizar el perfil" },
          { headers: response.headers }
        );
      }
    }

    return redirect("/dashboard", {
      headers: response.headers
    });
  } catch (error) {
    console.error('Error en el proceso de login:', error);
    return json(
      { error: "Error inesperado durante el login" },
      { headers: response.headers }
    );
  }
};

export default function Login() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      } px-4 py-6 sm:px-6 lg:px-8`}
    >
      <div
        className={`w-full max-w-md space-y-8 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } p-6 sm:p-8 rounded-2xl shadow-lg transition-all duration-300`}
      >
        <div className="absolute top-4 right-4">
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
        </div>

        <Header isDarkMode={isDarkMode} />

        <LoginForm isDarkMode={isDarkMode} />

        <div className="text-center space-y-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestión inteligente de información
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}