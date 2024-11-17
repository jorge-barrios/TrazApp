// Archivo: /app/components/login/Header.tsx

import { FC } from 'react';
import { QrCodeIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  isDarkMode: boolean;
}

const Header: FC<HeaderProps> = ({ isDarkMode }) => (
  <div className="text-center space-y-3">
    <div className={`mx-auto w-16 h-16 ${
      isDarkMode ? 'bg-gray-700' : 'bg-blue-600'
    } rounded-full flex items-center justify-center mb-4 transform transition-all duration-500 hover:scale-110`}>
      <QrCodeIcon className="h-8 w-8 text-white" />
    </div>
    
    <h1 className={`text-4xl font-bold ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`}>
      TrackAbility
    </h1>
    
    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      Trazabilidad de Exámenes Médicos
    </p>
    
    <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
  </div>
);

export default Header;