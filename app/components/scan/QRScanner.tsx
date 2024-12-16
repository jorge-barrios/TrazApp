import { useState, useEffect, lazy, Suspense } from 'react';

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
}

// Componente que solo se renderiza en el cliente
const ClientScanner = lazy(() => import('./ClientScanner'));

const QRScanner = ({ onResult, onError }: QRScannerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleResult = (result: any) => {
    if (!hasScanned) {
      setHasScanned(true);
      setError(null);
      onResult(result);
    }
  };

  const handleError = (error: Error) => {
    if (!hasScanned) {
      setError(error);
      onError && onError(error.message);
    }
  };

  const handleRetry = () => {
    setError(null);
    setHasScanned(false);
  };

  if (!isClient) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-lg">
        <p className="text-gray-300">Cargando escáner...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error.message}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Suspense fallback={
        <div className="p-8 text-center bg-gray-800 rounded-lg">
          <p className="text-gray-300">Cargando escáner...</p>
        </div>
      }>
        <ClientScanner onResult={handleResult} onError={handleError} />
      </Suspense>

      {/* Instrucciones */}
      <div className="mt-4 text-center text-gray-300">
        <p>Coloca el código QR dentro del marco</p>
        <p className="text-sm text-gray-400">La cámara se activará automáticamente</p>
      </div>
    </div>
  );
};

export default QRScanner;
