// app/routes/admin/_index.tsx
export default function AdminIndex() {
    return (
      <div className="p-6">
        {/* Header con título */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Administración del Sistema
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Panel de control administrativo
            </p>
          </div>
        </div>
  
        {/* Secciones administrativas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminCard 
            title="Gestión de Usuarios"
            description="Administrar usuarios y permisos del sistema"
            icon={UsersIcon}
            href="/admin/users"
          />
          <AdminCard 
            title="Centros Médicos"
            description="Configurar y gestionar centros médicos"
            icon={BuildingOfficeIcon}
            href="/admin/nodes"
          />
          <AdminCard 
            title="Configuración"
            description="Configuración general del sistema"
            icon={Cog6ToothIcon}
            href="/admin/settings"
          />
        </div>
      </div>
    );
  }
  
  // Componente para las tarjetas
  function AdminCard({ title, description, icon: Icon, href }: {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    href: string;
  }) {
    return (
      <Link
        to={href}
        className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-lg 
          shadow-sm hover:shadow-md transition-all duration-200 
          border border-gray-200 dark:border-gray-700 group"
      >
        <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white 
            group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </Link>
    );
  }