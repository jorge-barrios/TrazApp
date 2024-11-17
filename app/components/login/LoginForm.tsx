// Archivo: /app/components/login/LoginForm.tsx
import { FC, useState, FormEvent } from 'react';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import NodeSelector from './NodeSelector';
import { useLoginForm } from '~/hooks/useLoginForm';

interface LoginFormProps {
  isDarkMode: boolean;
}

const LoginForm: FC<LoginFormProps> = ({ isDarkMode }) => {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Agregar esto para prevenir el envío si hay errores
    let hasErrors = false;
    const newErrors: { email?: string; password?: string } = {};
    
    // Validaciones mejoradas
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
    e.target.submit(); // Solo enviar si no hay errores
  };

  const getEmailValidationState = () => {
    if (!formState.email) return 'empty';
    return validateEmail(formState.email) ? 'valid' : 'invalid';
  };

  const getPasswordValidationState = () => {
    if (!formState.password) return 'empty';
    return formState.password.length >= 6 ? 'valid' : 'invalid';
  };

  return (
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

      <div className="space-y-4" role="group" aria-label="Credenciales de acceso">
        {/* Email Input Group */}
        <div className="relative" role="group" aria-labelledby="email-label">
          <label id="email-label" className="sr-only">
            Correo electrónico
          </label>
          
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
            className={`block w-full pl-10 pr-3 py-2 sm:text-sm border rounded-lg 
              ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}
              ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
              focus:outline-none focus:ring-2 focus:border-transparent
              transition-all duration-200`}
          />
          
          {errors.email && (
            <p 
              id="email-error" 
              className="mt-1 text-sm text-red-500 dark:text-red-400" 
              role="alert"
            >
              {errors.email}
            </p>
          )}
          
          <div id="email-requirements" className="mt-1 text-xs text-gray-500" aria-live="polite">
            {formState.email && !validateEmail(formState.email) && 
              'Ingrese un correo electrónico válido (ejemplo@dominio.com)'}
          </div>
        </div>

        {/* Password Input Group */}
        <div className="relative" role="group" aria-labelledby="password-label">
          <label id="password-label" className="sr-only">
            Contraseña
          </label>
          
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
            className={`block w-full pl-10 pr-10 py-2 sm:text-sm border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
          />

          {/* Toggle Password Visibility Button */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeSlashIcon className={`h-5 w-5 ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
              } transition-colors`} />
            ) : (
              <EyeIcon className={`h-5 w-5 ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
              } transition-colors`} />
            )}
          </button>

          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-500 dark:text-red-400" role="alert">
              {errors.password}
            </p>
          )}
          
          <div id="password-requirements" className="mt-1 text-xs text-gray-500" aria-live="polite">
            {formState.password && formState.password.length < 6 && 
              'La contraseña debe tener al menos 6 caracteres'}
          </div>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div 
        className="flex items-center justify-between flex-wrap gap-2"
        role="group" 
        aria-label="Opciones adicionales"
      >
        <label className={`flex items-center space-x-2 text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <input
            type="checkbox"
            name="rememberMe"
            onChange={(e) => setRememberMe(e.target.checked)}
            checked={formState.rememberMe}
            className={`rounded ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-300 bg-white'
            } text-blue-500 focus:ring-blue-500 focus:ring-offset-0`}
            aria-label="Recordar sesión"
          />
          <span>Recordarme</span>
        </label>
        
        <button 
          type="button"
          className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
          aria-label="Recuperar contraseña"
        >
          ¿Olvidó su contraseña?
        </button>
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
        disabled={isSubmitting || !nodeId || !formState.email || !formState.password}
        className={`w-full relative py-2 px-4 border border-transparent rounded-lg 
          text-sm font-medium text-white 
          ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
          transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-70 disabled:cursor-not-allowed`}
        aria-label={isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        aria-busy={isSubmitting}
        aria-disabled={isSubmitting || !nodeId || !formState.email || !formState.password}
      >
        {isSubmitting ? (
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
  );
};

export default LoginForm;