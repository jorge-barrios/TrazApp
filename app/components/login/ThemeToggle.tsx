// Archivo: /app/components/login/ThemeToggle.tsx

import { FC } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const ThemeToggle: FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => (
  <button 
    onClick={onToggle} 
    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700/50 
      transition-all duration-300 focus:outline-none transform hover:scale-110"
  >
    {isDarkMode ? (
      <SunIcon className="h-6 w-6 text-yellow-400" />
    ) : (
      <MoonIcon className="h-6 w-6 text-gray-700" />
    )}
  </button>
);

export default ThemeToggle;