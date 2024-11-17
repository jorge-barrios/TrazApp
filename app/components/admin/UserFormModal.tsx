import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

interface Props {
  user?: {
    id: string;
    email: string;
    role: string;
    node_id: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({ user, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'user');
  const [password, setPassword] = useState('');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (user) {
      // Actualizar usuario existente
      const { error } = await supabase
        .from('profiles')
        .update({ email, role })
        .eq('id', user.id);
      
      if (!error) onSuccess();
    } else {
      // Obtener el node_id del usuario actual
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('node_id')
        .eq('id', currentUser.id)
        .single();

      if (!currentProfile) return;

      // Crear nuevo usuario
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (signUpError || !newUser.user) return;

      // Crear perfil para el nuevo usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email,
          role,
          node_id: currentProfile.node_id
        });
      
      if (!profileError) onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <form onSubmit={handleSubmit}>
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {user ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <div className="mt-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                {!user && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {user ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
