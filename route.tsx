import { Outlet } from "@remix-run/react";

export default function ExamsLayout() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Exámenes
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona y da seguimiento a los exámenes médicos
        </p>
      </div>

      <Outlet />
    </div>
  );
}
