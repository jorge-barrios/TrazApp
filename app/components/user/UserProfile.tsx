import { useAuthUser } from '~/hooks/useAuthUser';

export default function UserProfile() {
  const { user, loading, error } = useAuthUser();

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No se encontró el usuario</div>;

  return (
    <div className="p-4">
      <h1>Perfil de Usuario</h1>
      <div className="mt-4">
        <p>Email: {user.email}</p>
        <p>ID: {user.id}</p>
        // ...resto del perfil...
      </div>
    </div>
  );
}
