// app/components/admin/AdminUsersPage.tsx
import { FC } from 'react';
import type { Database } from '~/types/database';
import { 
  UsersIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Node = Database['public']['Tables']['nodes']['Row'];

interface AdminUsersPageProps {
  users: Profile[];
  nodes: Node[];
  isDarkMode: boolean;
}

// Componente para las tarjetas de estadísticas (similar al dashboard)
function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  colorClass 
}: { 
  icon: any; 
  title: string; 
  value: number; 
  colorClass: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center">
        <Icon className={`h-10 w-10 ${colorClass} mr-4`} />
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

const AdminUsersPage: FC<AdminUsersPageProps> = ({ users, nodes, isDarkMode }) => {
  // Calcular estadísticas
  const stats = {
    total: users.length,
    active: users.filter(user => user.active).length,
    byRole: {
      professional: users.filter(user => user.role === 'professional').length,
      transport: users.filter(user => user.role === 'transport').length,
      laboratory: users.filter(user => user.role === 'laboratory').length,
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-all">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Nuevo Usuario
        </button>
      </header>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={UsersIcon}
          title="Total Usuarios"
          value={stats.total}
          colorClass="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={UserGroupIcon}
          title="Usuarios Activos"
          value={stats.active}
          colorClass="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={BuildingOfficeIcon}
          title="Centros Médicos"
          value={nodes.length}
          colorClass="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Tabla de usuarios */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
        <div className="flex justify-between items-center mb-6">
          <div className="relative rounded-md shadow-sm w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md
                ${isDarkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-900 placeholder-gray-500'
                } focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Buscar usuarios..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Nombre</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Email</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Rol</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Nivel de Acceso</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Centro</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Estado</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Último acceso</th>
                <th className="py-2 px-4 text-right text-gray-600 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 px-4 text-gray-800 dark:text-white">
                    {user.full_name}
                  </td>
                  <td className="py-2 px-4 text-gray-800 dark:text-white">
                    {user.user_id}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium
                      ${user.role === 'professional' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : user.role === 'transport'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium
                      ${user.access_level === 'admin' 
                        ? 'bg-red-100 text-red-800'
                        : user.access_level === 'standard'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {user.access_level}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-gray-800 dark:text-white">
                    {nodes.find(node => node.id === user.node_id)?.display_name || '-'}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium
                      ${user.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-gray-800 dark:text-white">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminUsersPage;