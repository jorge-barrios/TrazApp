// Archivo: /app/routes/admin.users._index.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";
import {
  PlusIcon,
  PencilSquareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export async function loader({ request }: LoaderFunctionArgs) {
  const { response, supabase } = await requireAdmin(request);

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
       user_id,
       full_name,
       role,
       access_level,
       active,
       nodes (
         id,
         display_name,
         category
       )
     `)
      .order('full_name');

    if (error) throw error;

    return json({ users: users || [] }, {
      headers: response.headers
    });
  } catch (error) {
    console.error('Error loading users:', error);
    throw new Response('Error al cargar usuarios', { status: 400 });
  }
}

export default function UsersList() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="lg:flex lg:items-center lg:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <Link
                  to="/admin"
                  className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </Link>
                <div>
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                    Gestión de Usuarios
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Listado completo de usuarios registrados en el sistema
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <Link
                to="new"
                className="inline-flex items-center px-4 py-2 border border-transparent 
                 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
                 hover:bg-blue-700 focus:outline-none focus:ring-2 
                 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Nuevo Usuario
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                       dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                       dark:text-gray-400 uppercase tracking-wider">
                      Rol / Nivel
                    </th>
                    <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                       dark:text-gray-400 uppercase tracking-wider">
                      Centro Asignado
                    </th>
                    <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                       dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.role}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.access_level}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.nodes?.display_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.nodes?.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                         font-medium ${user.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={user.user_id}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 
                           dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilSquareIcon className="h-4 w-4 mr-1" />
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}