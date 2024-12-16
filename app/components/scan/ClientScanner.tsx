import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useIsMobile } from '~/hooks/useIsMobile';
import { useLocation } from '@remix-run/react';

interface ClientScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
}

const SCANNER_PREFERENCE_KEY = 'scannerPreference';

const ClientScanner = ({ onResult, onError }: ClientScannerProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);
  const scannerRef = useRef<any>(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Obtener la URL completa actual
  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${location.pathname}`
    : '';

  useEffect(() => {
    setIsClient(true);
    // Cargar preferencia guardada
    const savedPreference = localStorage.getItem(SCANNER_PREFERENCE_KEY);
    if (savedPreference === 'camera') {
      setShowScanner(true);
    }
  }, []);

  useEffect(() => {
    if (!showScanner || !isClient) return;

    const initializeScanner = async () => {
      try {
        // Importar dinámicamente html5-qrcode
        const { Html5QrcodeScanner } = await import('html5-qrcode');

        // Limpiar el scanner anterior si existe
        if (scannerRef.current) {
          await scannerRef.current.clear();
        }

        // Crear nuevo scanner
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2
          },
          false
        );

        scannerRef.current = scanner;

        // Manejar el éxito del escaneo
        const onScanSuccess = (decodedText: string) => {
          console.log('Código QR escaneado:', decodedText);
          try {
            onResult(decodedText);
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
            // Guardar preferencia al escanear exitosamente
            localStorage.setItem(SCANNER_PREFERENCE_KEY, 'camera');
          } catch (err) {
            console.error('Error al procesar el código:', err);
            if (onError) {
              onError('Error al procesar el código QR');
            }
          }
        };

        // Manejar errores del escaneo
        const onScanError = (err: any) => {
          console.warn('Error al escanear:', err);
        };

        // Iniciar el scanner
        await scanner.render(onScanSuccess, onScanError);
        console.log('Scanner iniciado');
        setHasPermission(true);
      } catch (err) {
        console.error('Error al iniciar el scanner:', err);
        setHasPermission(false);
        if (onError) {
          onError('No se pudo acceder a la cámara');
        }
      }
    };

    initializeScanner();

    // Cleanup al desmontar
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [showScanner, onResult, onError, isClient]);

  const handleStartScanner = () => {
    setShowScanner(true);
    localStorage.setItem(SCANNER_PREFERENCE_KEY, 'camera');
  };

  const handleBack = () => {
    setShowScanner(false);
    setHasPermission(null);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    // No eliminamos la preferencia al volver, solo cuando se elige explícitamente otra opción
  };

  const renderScanner = () => (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden p-4">
      <div id="qr-reader" className="w-full max-w-lg mx-auto" />
      
      {/* Instrucciones */}
      <div className="mt-4 text-center">
        <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded inline-block">
          Centra el código QR en el marco y mantén el dispositivo estable
        </p>
      </div>
    </div>
  );

  const renderQRLink = () => (
    <div className="p-8 text-center bg-gray-800 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">
        Escanea desde tu móvil
      </h3>
      <p className="text-gray-400 mb-4">
        También puedes acceder desde tu dispositivo móvil escaneando este código:
      </p>
      <div className="bg-white p-4 rounded-lg inline-block">
        <QRCodeSVG
          value={currentUrl}
          size={200}
          level="H"
          includeMargin={true}
          className="mx-auto"
        />
        <p className="mt-2 text-sm text-gray-600 break-all">
          {currentUrl}
        </p>
      </div>
    </div>
  );

  if (!isClient) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-lg">
        <p className="text-gray-300">Cargando escáner...</p>
      </div>
    );
  }

  if (!showScanner) {
    return (
      <div className="space-y-6">
        <div className="p-8 text-center bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            Elige cómo escanear
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartScanner}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg 
                className="w-6 h-6 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Usar cámara {isMobile ? 'del dispositivo' : 'web'}
            </button>
          </div>
        </div>
        {!isMobile && renderQRLink()}
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-lg">
        <p className="text-red-400 mb-4">No se pudo acceder a la cámara</p>
        <p className="text-gray-300 text-sm mb-4">
          Por favor, permite el acceso a la cámara desde la configuración de tu navegador
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setHasPermission(null);
              setShowScanner(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => {
              setShowScanner(false);
              setHasPermission(null);
              localStorage.removeItem(SCANNER_PREFERENCE_KEY); // Limpiar preferencia si hay error
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderScanner()}
      <div className="text-center">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Volver a opciones
        </button>
      </div>
    </div>
  );
};

export default ClientScanner;
