// Archivo: /app/components/login/LoadingSpinner.tsx

import { FC } from 'react';

const LoadingSpinner: FC = () => (
  <div className="flex items-center justify-center">
    <div className="inline-block h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
    <span>Iniciando sesión...</span>
  </div>
);

export default LoadingSpinner;