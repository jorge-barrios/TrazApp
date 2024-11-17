import { useAuthUser } from '~/hooks/useAuthUser';

export default function Navigation() {
  const { user } = useAuthUser();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          // ...existing navigation code...
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link to="/login">Iniciar sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
