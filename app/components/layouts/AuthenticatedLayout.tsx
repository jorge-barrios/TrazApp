import { useAuthUser } from '~/hooks/useAuthUser';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation user={user} />
      <main className="py-10">
        {children}
      </main>
    </div>
  );
}
