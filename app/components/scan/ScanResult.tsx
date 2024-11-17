// Archivo: /app/components/scan/ScanResult.tsx
import { 
    CheckCircleIcon, 
    XCircleIcon,
    ArrowPathIcon 
  } from '@heroicons/react/24/outline';
  
  interface ScanResultProps {
    result: string;
    isValid: boolean;
    error?: string;
    onReset: () => void;
    onConfirm: () => void;
  }
  
  const ScanResult = ({ result, isValid, error, onReset, onConfirm }: ScanResultProps) => {
    return (
      <div className="w-full max-w-lg mx-auto p-6 bg-gray-800/40 rounded-lg">
        <div className="flex items-center justify-center mb-4">
          {isValid ? (
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          ) : (
            <XCircleIcon className="h-12 w-12 text-red-500" />
          )}
        </div>
        
        <h3 className="text-lg font-medium text-white text-center mb-2">
          {isValid ? 'Código QR válido' : 'Código QR no válido'}
        </h3>
        
        {error ? (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : (
          <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
            <pre className="text-sm text-gray-300 break-all whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
  
        <div className="flex justify-center space-x-4">
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Escanear otro
          </button>
          {isValid && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirmar
            </button>
          )}
        </div>
      </div>
    );
  };
  
  export default ScanResult;