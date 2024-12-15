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
import { FC, ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, Form } from '@remix-run/react';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

const MainLayout: FC<MainLayoutProps> = ({ children, className = '' }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedState = typeof window !== 'undefined' ? localStorage.getItem('sidebar-collapsed') : null;
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { name: 'Inicio', href: '/', icon: HomeIcon },
    { 
      name: 'Exámenes', 
      href: '/exams', 
      icon: BeakerIcon,
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
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`flex h-screen bg-gray-900 ${className}`} style={{ overflow: 'hidden', gridTemplateColumns: `${isCollapsed ? '4rem' : '15rem'} 1fr` }}>
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
        transform transition-all duration-500 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-64'}
        flex flex-col overflow-hidden
        bg-gray-800
      `}>
        <div className="flex flex-col flex-grow pt-5 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-3 mb-6">
            <span className={`text-xl font-bold text-white transition-opacity duration-500 ease-in-out 
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
              onClick={() => {
    setIsCollapsed(prev => {
      const newState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', newState.toString());
      }
      return newState;
    });
  }}
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
                    transition-all duration-500 ease-in-out
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
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </div>
                  
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-3 py-4 border-t border-gray-700">
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
                <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0 mr-3" />
                {!isCollapsed && <span>Cerrar Sesión</span>}
                
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto`}>
        <main className="h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
