// app/components/layouts/MainLayout.tsx
import { 
  QrCodeIcon, 
  HomeIcon, 
  UserIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BeakerIcon, // Para exámenes
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { FC, ReactNode, useState } from 'react';
import { Link, useLocation, Form } from '@remix-run/react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Actualizamos la navegación para incluir exámenes
  const navigation = [
    { name: 'Inicio', href: '/', icon: HomeIcon },
    { 
      name: 'Exámenes', 
      href: '/exams', 
      icon: BeakerIcon,
      // Subnavegación futura si se necesita
      submenu: [
        { name: 'Lista', href: '/exams' },
        { name: 'Nuevo', href: '/exams/new' }
      ] 
    },
    { name: 'Escanear', href: '/scan', icon: QrCodeIcon },
    { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
    { name: 'Administración', href: '/admin', icon: Cog6ToothIcon },
    { name: 'Perfil', href: '/profile', icon: UserIcon }
  ];

  const isCurrentPath = (path: string) => {
    // Mejoramos la detección de ruta actual para que funcione con subrutas
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-gray-900 relative overflow-hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-gray-400 hover:text-white"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-60 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-64'}
        flex flex-col overflow-x-hidden
      `}>
        <div className="flex flex-col flex-grow pt-5 bg-gray-800 h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-3 mb-6">
            <span className={`text-xl font-bold text-white transition-opacity duration-200 
              ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              TrazApp
            </span>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Collapse button for desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block p-2 rounded-md text-gray-400 hover:text-white"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-6 w-6" />
              ) : (
                <ChevronLeftIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentPath(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group relative flex items-center mx-3 px-3 py-2 text-sm font-medium rounded-md
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <Icon className={`
                      h-6 w-6 flex-shrink-0
                      ${isCollapsed ? 'mx-auto' : 'mr-3'}
                    `} />
                    {/* Texto visible cuando no está colapsado */}
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </div>
                  
                  {/* Tooltip cuando está colapsado */}
                  {isCollapsed && (
                    <div className="
                      absolute left-full top-1/2 -translate-y-1/2
                      ml-2 px-2 py-1 bg-gray-700 rounded-md
                      invisible opacity-0 group-hover:visible group-hover:opacity-100
                      transition-all duration-100 whitespace-nowrap z-50
                    ">
                      <span className="text-white">{item.name}</span>
                      <div className="
                        absolute right-full top-1/2 -translate-y-1/2
                        h-2 w-2 bg-gray-700
                        transform rotate-45
                      "/>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-3 py-4 mt-auto border-t border-gray-700">
            <Form action="/logout" method="post">
              <button
                type="submit"
                className="
                  group relative flex items-center w-full px-3 py-2
                  text-sm font-medium rounded-md
                  text-red-300 hover:bg-red-600/20 hover:text-red-100
                  transition-all duration-200
                "
              >
                <ArrowLeftOnRectangleIcon className={`
                  h-6 w-6 flex-shrink-0
                  ${isCollapsed ? 'mx-auto' : 'mr-3'}
                `} />
                {!isCollapsed && (
                  <span>Cerrar Sesión</span>
                )}
                {isCollapsed && (
                  <div className="
                    absolute left-12 z-50
                    px-2 py-1 ml-6
                    bg-gray-700 rounded-md
                    invisible opacity-0
                    group-hover:visible group-hover:opacity-100
                    transition-all duration-100
                    whitespace-nowrap
                  ">
                    Cerrar Sesión
                    <div className="
                      absolute -left-1 top-1/2 -translate-y-1/2
                      h-2 w-2
                      bg-gray-700
                      transform rotate-45
                    "/>
                  </div>
                )}
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="
        flex-1 min-h-screen
        transition-all duration-300 ease-in-out
        md:pl-0
      ">
        <main className="h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;