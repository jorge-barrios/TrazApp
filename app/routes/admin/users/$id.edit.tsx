// admin.tsx - Layout principal de administración
// admin._index.tsx - Lista de usuarios
// admin.users.new.tsx - Crear nuevo usuario
// admin.users.$userId.edit.tsx - Editar usuario

// app/routes/admin.users.$userId.edit.tsx
import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from "~/types/database.types";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const { id } = params;

  try {
    // Cargar datos del usuario
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        nodes:nodes (
          id,
          display_name,
          category
        )
      `)
      .eq('user_id', id);

    if (profileError) throw profileError;
    if (!profiles || profiles.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const profile = profiles[0];

    // Cargar lista de nodos para el selector
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .eq('active', true)
      .order('display_name');

    if (nodesError) throw nodesError;

    return json({
      profile,
      nodes: nodes || [],
      roles: ['professional', 'transport', 'laboratory'],
      accessLevels: ['admin', 'user']
    }, {
      headers: response.headers
    });

  } catch (error) {
    console.error('Error loading profile:', error);
    throw new Response(error instanceof Error ? error.message : 'Error al cargar el perfil', 
      { status: 400 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const formData = await request.formData();
  const { id } = params;

  const updates = {
    full_name: formData.get('fullName') as string,
    role: formData.get('role') as string,
    access_level: formData.get('accessLevel') as string,
    node_id: formData.get('nodeId') as string,
    active: formData.get('active') === 'true'
  };

  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', id);

    if (error) throw error;

    return json({ success: true }, {
      headers: response.headers
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return json({ error: 'Error al actualizar el perfil' }, {
      status: 400,
      headers: response.headers
    });
  }
}

export default function EditUser() {
  const { profile, nodes, roles, accessLevels } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Usuario
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Modifica los datos del usuario
          </p>
        </header>

        {actionData?.success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
            Perfil actualizado correctamente
          </div>
        )}

        {actionData?.error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {/* Nombre Completo */}
          <div>
            <label 
              htmlFor="fullName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Nombre Completo
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              defaultValue={profile.full_name}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 px-3 py-2 text-sm 
                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                dark:text-white"
            />
          </div>

          {/* Rol */}
          <div>
            <label 
              htmlFor="role" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Rol
            </label>
            <select
              name="role"
              id="role"
              defaultValue={profile.role}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 px-3 py-2 text-sm 
                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                dark:text-white"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel de Acceso */}
          <div>
            <label 
              htmlFor="accessLevel" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Nivel de Acceso
            </label>
            <select
              name="accessLevel"
              id="accessLevel"
              defaultValue={profile.access_level}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 px-3 py-2 text-sm 
                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                dark:text-white"
            >
              {accessLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Centro/Nodo */}
          <div>
            <label 
              htmlFor="nodeId" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Centro
            </label>
            <select
              name="nodeId"
              id="nodeId"
              defaultValue={profile.node_id}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 px-3 py-2 text-sm 
                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                dark:text-white"
            >
              {nodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.display_name} - {node.category}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              defaultChecked={profile.active}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
                text-blue-600 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            />
            <label 
              htmlFor="active" 
              className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
            >
              Usuario Activo
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 
                bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white 
                bg-blue-600 border border-transparent rounded-md 
                hover:bg-blue-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar Cambios
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}