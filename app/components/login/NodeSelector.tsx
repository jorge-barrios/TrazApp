// Archivo: /app/components/login/NodeSelector.tsx
import { FC } from 'react';
import {
  BuildingOfficeIcon,
  TruckIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface NodeSelectorProps {
  selectedCategory: string | null;
  centerId: string;
  isDarkMode: boolean;
  onCategorySelect: (category: string) => void;
  onCenterIdChange: (value: string) => void;
}

const NODES = [
  { 
    id: 'CESFAM',
    label: 'Centro de Salud',
    icon: BuildingOfficeIcon,
    prefix: 'cesfam',
    placeholder: 'ej: trinidad'
  },
  { 
    id: 'TRANSPORTE',
    label: 'Transporte',
    icon: TruckIcon,
    prefix: 'transporte',
    placeholder: 'ej: movil1'
  },
  { 
    id: 'LABORATORIO',
    label: 'Laboratorio',
    icon: BeakerIcon,
    prefix: 'lab',
    placeholder: 'ej: central'
  }
] as const;

const NodeSelector: FC<NodeSelectorProps> = ({
  selectedCategory,
  centerId,
  isDarkMode,
  onCategorySelect,
  onCenterIdChange
}) => {
  const selectedNode = NODES.find(node => node.id === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Selector de tipo de centro */}
      <div className="grid grid-cols-3 gap-3">
        {NODES.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedCategory === node.id;
          
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onCategorySelect(node.id)}
              className={`p-3 rounded-lg border transition-all duration-300
                ${isSelected
                  ? isDarkMode 
                    ? 'bg-gray-800 border-blue-500'
                    : 'bg-blue-50 border-blue-500'
                  : isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500'
                    : 'bg-gray-100 border-gray-200 hover:border-blue-500'
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon 
                  className={`h-6 w-6 ${
                    isSelected
                      ? 'text-blue-500'
                      : isDarkMode ? 'text-blue-400' : 'text-blue-500'
                  }`}
                />
                <span className={`text-sm ${
                  isSelected
                    ? 'text-blue-500'
                    : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {node.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Campo de identificador */}
      <div className="relative">
        <input
          type="text"
          value={centerId}
          onChange={(e) => onCenterIdChange(e.target.value.toLowerCase())}
          placeholder={selectedNode 
            ? selectedNode.placeholder 
            : "Seleccione un tipo de centro"}
          disabled={!selectedCategory}
          className={`w-full px-4 py-2.5 border rounded-lg
            transition-all duration-200 text-sm
            ${isDarkMode
              ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
              : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
            }
            ${selectedCategory 
              ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
              : 'opacity-50 cursor-not-allowed'
            }
          `}
        />
      </div>
    </div>
  );
};

export default NodeSelector;