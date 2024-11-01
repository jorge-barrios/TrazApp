import { FC, useState } from 'react';
import { BuildingOfficeIcon, TruckIcon, BeakerIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { MoonIcon, SunIcon, QrCodeIcon } from '@heroicons/react/24/solid';

interface FormErrors {
  email?: string;
  password?: string;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="inline-block h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
    <span>Iniciando sesión...</span>
  </div>
);

const Login: FC = () => {
  // ... (mantener los estados y funciones)
  const [selectedNode, setSelectedNode] = useState<string | null>('CESFAM');
  const [customNode, setCustomNode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Cambiado a true por defecto

  // ... (mantener las funciones de manejo)
  const handleNodeSelection = (node: string) => {
    setSelectedNode(node);
    setCustomNode('');
  };

  const handleCustomNodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomNode(event.target.value);
    setSelectedNode(null);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log({
        node: selectedNode || customNode,
        email,
        password,
        rememberMe
      });
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    } p-4`}>
      <div className={`max-w-md w-full space-y-8 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      } p-8 sm:p-10 rounded-2xl shadow-lg transition-all duration-300`}>
        {/* Botón de tema */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700/50 
            transition-all duration-300 focus:outline-none transform hover:scale-110"
        >
          {isDarkMode ? (
            <SunIcon className="h-6 w-6 text-yellow-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-700" />
          )}
        </button>

        {/* Header con logo de QR */}
        <div className="text-center space-y-3">
          <div className={`mx-auto w-16 h-16 ${
            isDarkMode ? 'bg-gray-700' : 'bg-blue-600'
          } rounded-full flex items-center justify-center mb-4 transform transition-all duration-500 hover:scale-110`}>
            <QrCodeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-4xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            TrackaAbility
          </h1>
          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Trazabilidad de Exámenes Médicos</p>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          {/* Nodos de Ingreso */}
          <div className="space-y-4">
            <label className={`block ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } text-sm font-medium`}>
              Seleccione su Punto de Acceso
              <span className="text-gray-500 text-xs ml-1">(requerido)</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['CESFAM', 'Transporte', 'Laboratorio'].map((node) => (
                <button
                  key={node}
                  type="button"
                  onClick={() => handleNodeSelection(node)}
                  className={`group relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300
                    ${selectedNode === node 
                      ? isDarkMode 
                        ? 'border-blue-500 bg-gray-700 text-blue-400' 
                        : 'border-blue-600 bg-blue-50 text-blue-700'
                      : isDarkMode
                        ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                    } hover:shadow-xl hover:scale-105 transform`}
                >
                  <div className="flex flex-col items-center">
                    <div className="transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-3">
                      {node === 'CESFAM' && (
                        <BuildingOfficeIcon className={`h-10 w-10 mb-2 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      )}
                      {node === 'Transporte' && (
                        <TruckIcon className={`h-10 w-10 mb-2 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      )}
                      {node === 'Laboratorio' && (
                        <BeakerIcon className={`h-10 w-10 mb-2 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      )}
                    </div>
                    <span className="text-sm font-medium relative z-10">{node}</span>
                  </div>
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Especifique punto de acceso"
              value={customNode}
              onChange={handleCustomNodeChange}
              className={`w-full px-4 py-3 rounded-xl ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300
              placeholder-gray-500 hover:shadow-md`}
            />
          </div>

          {/* Campos de acceso */}
          <div className="space-y-6">
            <div className="relative group">
              <EnvelopeIcon className={`absolute left-3 top-3.5 h-5 w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } transition-transform duration-300 group-hover:scale-110`} />
              <input
                type="email"
                required
                value={email}
                placeholder="nombre@institución.cl"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({...errors, email: undefined});
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300
                placeholder-gray-500 hover:shadow-md`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="relative group">
              <LockClosedIcon className={`absolute left-3 top-3.5 h-5 w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } transition-transform duration-300 group-hover:scale-110`} />
              <input
                type="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({...errors, password: undefined});
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300
                placeholder-gray-500 hover:shadow-md`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className={`flex items-center space-x-2 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span>Recordarme</span>
            </label>
            <button 
              type="button"
              className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-700
              text-white font-medium py-3 px-4 rounded-xl transition-all duration-300
              transform hover:scale-[1.02] active:scale-95
              disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <span className="relative z-10">
              {isLoading ? <LoadingSpinner /> : 'Iniciar Sesión'}
            </span>
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema de gestión inteligente
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;