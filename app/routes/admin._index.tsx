// Archivo: /app/routes/admin._index.tsx
import { Link } from "@remix-run/react";
import {
  UsersIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
}

const AdminCard = ({ title, description, icon: Icon, href }: AdminCardProps) => {
  return (
    <Link
      to={href}
      className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-lg 
        shadow-sm hover:shadow-md transition-all duration-200 
        border border-gray-200 dark:border-gray-700 group"
    >
      <div className="mr-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white 
          group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
};

const ADMIN_SECTIONS = [
  {
    title: "Gestión de Usuarios",
    description: "Administrar usuarios y permisos del sistema",
    icon: UsersIcon,
    href: "users"
  },
  {
    title: "Centros Médicos",
    description: "Configurar y gestionar centros médicos",
    icon: BuildingOfficeIcon,
    href: "nodes"
  },
  {
    title: "Configuración",
    description: "Configuración general del sistema",
    icon: Cog6ToothIcon,
    href: "settings"
  }
];

export default function AdminIndex() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Administración del Sistema
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Panel de control administrativo
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <AdminCard
            key={section.href}
            {...section}
          />
        ))}
      </div>
    </div>
  );
}