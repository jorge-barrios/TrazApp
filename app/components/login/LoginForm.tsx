// Archivo: /app/components/login/LoginForm.tsx
import { FC, useState, FormEvent, useEffect } from 'react';
import { Form, useActionData, useNavigation, useNavigate } from '@remix-run/react';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import NodeSelector from './NodeSelector';
import SuccessAnimation from './SuccessAnimation';
import { useLoginForm } from '~/hooks/useLoginForm';

interface LoginFormProps {
  isDarkMode: boolean;
}

const LoginForm: FC<LoginFormProps> = ({ isDarkMode }) => {
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const {
    formState,
    setEmail,
    setPassword,
    setSelectedCategory,
    setCenterId,
    setRememberMe,
    clearError,
    getNodeId
  } = useLoginForm(actionData?.fields);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const nodeId = getNodeId();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let hasErrors = false;
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formState.email?.trim()) {
      newErrors.email = 'El email es requerido';
      hasErrors = true;
    } else if (!validateEmail(formState.email)) {
      newErrors.email = 'Por favor ingrese un email válido';
      hasErrors = true;
    }
    
    if (!formState.password?.trim()) {
      newErrors.password = 'La contraseña es requerida';
      hasErrors = true;
    } else if (formState.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    
    // Usar el sistema de acciones de Remix en lugar de fetch directo
    (e.target as HTMLFormElement).submit();
  };

  // Manejar la respuesta de la acción
  useEffect(() => {
    if (actionData?.error) {
      setErrors({ email: actionData.error });
      setIsLoading(false);
    } else if (navigation.state === "idle" && navigation.formData) {
      setShowSuccess(true);
      navigate('/dashboard');
    }
  }, [actionData, navigation.state, navigation.formData]);

  // Actualizar estado de carga basado en la navegación
  useEffect(() => {
    setIsLoading(navigation.state !== "idle");
  }, [navigation.state]);

  const getEmailValidationState = () => {
    if (!formState.email) return 'empty';
    return validateEmail(formState.email) ? 'valid' : 'invalid';
  };

  const getPasswordValidationState = () => {
    if (!formState.password) return 'empty';
    return formState.password.length >= 6 ? 'valid' : 'invalid';
  };

  return (
    <>
      <SuccessAnimation 
        show={showSuccess} 
        onAnimationComplete={() => {
          navigate('/dashboard');
        }} 
      />
      
      <Form 
        method="post" 
        className="mt-8 space-y-6" 
        onSubmit={handleSubmit}
        aria-label="Formulario de inicio de sesión"
        noValidate
      >
        {actionData?.error && (
          <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
            {actionData.error}
          </div>
        )}

        <NodeSelector
          selectedCategory={formState.selectedCategory}
          centerId={formState.centerId}
          isDarkMode={isDarkMode}
          onCategorySelect={setSelectedCategory}
          onCenterIdChange={setCenterId}
        />

        <div className="space-y-2" role="group" aria-label="Credenciales de acceso">
          {/* Email Input Group */}
          <div className="relative min-h-[64px]" role="group" aria-labelledby="email-label">
            <label id="email-label" className="sr-only">
              Correo electrónico
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className={`h-5 w-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } ${errors.email ? 'text-red-400' : ''}`} />
              </div>
              
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                spellCheck="false"
                aria-label="Correo electrónico"
                aria-required="true"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={`email-error email-requirements`}
                value={formState.email}
                placeholder="nombre@institución.cl"
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                className={`appearance-none block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-lg 
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}
                  ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                  focus:outline-none focus:ring-2 focus:border-transparent
                  transition-all duration-200`}
              />
            </div>
            
            <div className="absolute mt-1 text-sm">
              {errors.email ? (
                <p 
                  id="email-error" 
                  className="text-red-500 dark:text-red-400" 
                  role="alert"
                >
                  {errors.email}
                </p>
              ) : formState.email && !validateEmail(formState.email) ? (
                <p id="email-requirements" className="text-xs text-gray-500" aria-live="polite">
                  Por favor ingrese un email válido
                </p>
              ) : null}
            </div>
          </div>

          {/* Password Input Group */}
          <div className="relative min-h-[64px]" role="group" aria-labelledby="password-label">
            <label id="password-label" className="sr-only">
              Contraseña
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className={`h-5 w-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                aria-label="Contraseña"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                value={formState.password}
                placeholder="••••••••"
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                className={`appearance-none block w-full pl-10 pr-10 py-2.5 sm:text-sm border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center transition-opacity duration-200 hover:opacity-80"
              >
                {showPassword ? (
                  <EyeSlashIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <EyeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>
            </div>

            <div className="absolute mt-1 text-sm">
              {errors.password ? (
                <p 
                  id="password-error" 
                  className="text-red-500 dark:text-red-400" 
                  role="alert"
                >
                  {errors.password}
                </p>
              ) : formState.password && formState.password.length < 6 ? (
                <p id="password-requirements" className="text-xs text-gray-500" aria-live="polite">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={formState.rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={`h-4 w-4 rounded border-gray-300 
                ${isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-blue-500' 
                  : 'bg-white border-gray-300 text-blue-600'}
                focus:ring-blue-500`}
            />
            <label
              htmlFor="remember-me"
              className={`ml-2 block text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}
            >
              Recordarme
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className={`font-medium ${
                isDarkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              ¿Olvidó su contraseña?
            </a>
          </div>
        </div>

        {/* Hidden input para asegurar que el valor se envía */}
        <input 
          type="hidden" 
          name="rememberMe" 
          value={formState.rememberMe ? "true" : "false"} 
        />

        {/* Agregar este input para el nodeId */}
        <input
          type="hidden"
          name="nodeId"
          value={nodeId || ''}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !nodeId || !formState.email || !formState.password}
          className={`w-full relative py-2 px-4 border border-transparent rounded-lg 
            text-sm font-medium text-white 
            ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
            transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:opacity-70 disabled:cursor-not-allowed`}
          aria-label={isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          aria-busy={isLoading}
          aria-disabled={isLoading || !nodeId || !formState.email || !formState.password}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span className="sr-only">Procesando inicio de sesión</span>
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>

        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500" aria-hidden="true">
            <p>Node ID: {nodeId || 'none'}</p>
            <p>Remember Me: {formState.rememberMe.toString()}</p>
            <p>Email State: {getEmailValidationState()}</p>
            <p>Password State: {getPasswordValidationState()}</p>
          </div>
        )}
      </Form>
    </>
  );
};

export default LoginForm;