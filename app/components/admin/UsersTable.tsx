import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

interface User {
  id: string;
  email: string;
  role: string;
  node_id: string;
  created_at: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('node_id, role')
      .eq('id', user.id)
      .single();

    if (!currentProfile) return;

    // Si es superadmin ve todos los usuarios, si no solo los de su nodo
    const query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        role,
        node_id,
        created_at
      `);

    if (currentProfile.role !== 'superadmin') {
      query.eq('node_id', currentProfile.node_id);
    }

    const { data, error } = await query;
    if (!error && data) setUsers(data);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Usuarios</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Agregar usuario
          </button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nivel de Acceso</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha creación</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
