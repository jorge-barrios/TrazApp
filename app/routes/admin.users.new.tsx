// Archivo: /app/routes/admin.users.new.tsx
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import { supabaseAdmin } from "~/lib/supabase.admin.server";
import { createAdminSupabase } from "~/lib/supabase.admin.server";
import {
  ArrowLeftIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

export async function loader({ request }: LoaderFunctionArgs) {
  const { response, supabase } = await requireAdmin(request);

  try {
    // Cargar lista de nodos disponibles
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .eq('active', true)
      .order('display_name');

    if (nodesError) throw nodesError;

    return json({
      nodes: nodes || [],
      roles: ['professional', 'transport', 'laboratory'],
      accessLevels: ['admin', 'user']
    }, {
      headers: response.headers
    });

  } catch (error) {
    console.error('Error loading data:', error);
    throw new Response('Error al cargar datos necesarios', { status: 400 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { response } = await requireAdmin(request);
  const formData = await request.formData();

  try {
    // Crear una instancia del cliente admin
    const adminClient = createAdminSupabase();

    // Crear el usuario usando la API de admin
    const { data: { user }, error: authError } = await adminClient.auth.admin.createUser({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      email_confirmed_at: new Date().toISOString(), // Auto confirma el email
      user_metadata: {
        full_name: formData.get('fullName'),
      }
    });

    if (authError) throw authError;
    if (!user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Crear el perfil
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        user_id: user.id,
        full_name: formData.get('fullName') as string,
        role: formData.get('role') as string,
        access_level: formData.get('accessLevel') as string,
        node_id: formData.get('nodeId') as string,
        active: formData.get('active') !== null
      });

    if (profileError) {
      // Si falla la creación del perfil, eliminar el usuario
      await adminClient.auth.admin.deleteUser(user.id);
      throw profileError;
    }

    return redirect('/admin/users');

  } catch (error) {
    console.error('Error creating user:', error);
    return json({
      error: 'Error al crear el usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, {
      status: 400,
      headers: response.headers
    });
  }
}

export default function NewUser() {
  const { nodes, roles, accessLevels } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center">
              <Link
                to="/admin/users"
                className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </Link>
              <div>
                <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl">
                  Nuevo Usuario
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Crear un nuevo usuario en el sistema
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <Form method="post" className="space-y-6 p-6">
              {actionData?.error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Error al crear usuario
                      </h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        <p>{actionData.error}</p>
                        {actionData.details && (
                          <p className="mt-1 text-xs opacity-75">{actionData.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
                <div className="space-y-6 pt-8 first:pt-0">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                      <UserPlusIcon className="h-6 w-6 mr-2" />
                      Información del Usuario
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Ingrese la información del nuevo usuario
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Nombre Completo */}
                    <div className="sm:col-span-4">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre Completo
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          required
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                            border-gray-300 dark:border-gray-600 rounded-md 
                            dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Correo Electrónico
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                            border-gray-300 dark:border-gray-600 rounded-md
                            dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Contraseña */}
                    <div className="sm:col-span-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contraseña
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="password"
                          id="password"
                          required
                          minLength={6}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                            border-gray-300 dark:border-gray-600 rounded-md
                            dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Mínimo 6 caracteres
                      </p>
                    </div>

                    {/* Rol */}
                    <div className="sm:col-span-3">
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rol
                      </label>
                      <div className="mt-1">
                        <select
                          id="role"
                          name="role"
                          required
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                            border-gray-300 dark:border-gray-600 rounded-md
                            dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Seleccione un rol</option>
                          {roles.map(role => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Nivel de Acceso */}
                    <div className="sm:col-span-3">
                      <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nivel de Acceso
                      </label>
                      <div className="mt-1">
                        <select
                          id="accessLevel"
                          name="accessLevel"
                          required
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                            border-gray-300 dark:border-gray-600 rounded-md
                            dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Seleccione un nivel</option>
                          {accessLevels.map(level => (
                            <option key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Centro Asignado */}
                    <div className="sm:col-span-4">
                      <label htmlFor="nodeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Centro Asignado
                      </label>
                      <div className="mt-1">
                        <select
                          id="nodeId"
                          name="nodeId"
                          required
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                            border-gray-300 dark:border-gray-600 rounded-md
                            dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Seleccione un centro</option>
                          {nodes.map(node => (
                            <option key={node.id} value={node.id}>
                              {node.display_name} - {node.category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Estado Activo */}
                    <div className="sm:col-span-4">
                      <div className="flex items-center">
                        <input
                          id="active"
                          name="active"
                          type="checkbox"
                          defaultChecked={true}
                          value="true"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 
                            border-gray-300 dark:border-gray-600 rounded
                            dark:bg-gray-700"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Usuario Activo
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Link
                  to="/admin/users"
                  className="inline-flex justify-center py-2 px-4 border border-transparent 
                    shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 
                    bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent 
                    shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}