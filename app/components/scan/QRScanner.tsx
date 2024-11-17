// Archivo: /app/components/scan/QRScanner.tsx
import { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
}

const QRScanner = ({ onResult, onError }: QRScannerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('prompt');
  const scannerRef = useRef<any>(null);

  const requestCameraPermission = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { min: 1280, ideal: 1920, max: 2560 },
          height: { min: 720, ideal: 1080, max: 1440 },
          aspectRatio: { ideal: 1.7777777778 },
          focusMode: 'continuous'
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      setHasCamera(true);
      setPermissionState('granted');
      initializeScanner();
    } catch (error) {
      console.error('Error requesting camera:', error);
      setPermissionState('denied');
      setHasCamera(false);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeScanner = async () => {
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 15,
          qrbox: { width: 400, height: 400 },
          aspectRatio: 1.7777777778,
          disableFlip: false,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          rememberLastUsedCamera: true,
          videoConstraints: {
            width: { min: 1280, ideal: 1920, max: 2560 },
            height: { min: 720, ideal: 1080, max: 1440 },
            facingMode: "environment",
            aspectRatio: 1.7777777778,
            focusMode: "continuous"
          }
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText: string) => {
          onResult(decodedText);
        },
        (errorMessage: string) => {
          if (!errorMessage.includes('NotFoundException')) {
            console.error('Scan error:', errorMessage);
            if (onError) {
              onError(errorMessage);
            }
          }
        }
      );

      const style = document.createElement('style');
      style.textContent = `
        #qr-reader {
          border: none !important;
          padding: 0 !important;
        }
        #qr-reader__scan_region {
          min-height: 400px !important;
          background: #1a1a1a !important;
        }
        #qr-reader video {
          max-width: 100% !important;
          object-fit: cover !important;
        }
        #qr-reader__dashboard {
          padding: 1rem !important;
          background: #1f2937 !important;
        }
        #qr-reader__status_span {
          color: #9ca3af !important;
          background: transparent !important;
        }
        #qr-reader select {
          background: #374151 !important;
          color: white !important;
          border: 1px solid #4b5563 !important;
          padding: 0.5rem !important;
          border-radius: 0.375rem !important;
          margin-bottom: 1rem !important;
        }
        #qr-reader button {
          background: #2563eb !important;
          color: white !important;
          border: none !important;
          padding: 0.5rem 1rem !important;
          border-radius: 0.5rem !important;
          margin: 0.5rem !important;
        }
        #qr-reader__camera_selection {
          margin-bottom: 1rem !important;
        }
      `;
      document.head.appendChild(style);

    } catch (error) {
      console.error('Scanner initialization error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Error inicializando el scanner');
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then((result) => {
          setPermissionState(result.state);
          if (result.state === 'granted') {
            requestCameraPermission();
          }
        });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isClient]);

  if (!isClient || isLoading) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="p-6 bg-gray-800 rounded-lg">
          <div className="animate-pulse">
            <div className="h-72 bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
          </div>
          <p className="text-center text-gray-400 mt-4">Inicializando cámara...</p>
        </div>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="p-6 bg-gray-800 rounded-lg">
          <p className="text-red-400 text-center mb-4">
            El acceso a la cámara fue denegado
          </p>
          <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-400">Para usar el escáner QR:</p>
            <ol className="list-decimal list-inside text-sm text-gray-400 mt-2">
              <li>Hacer clic en el ícono de cámara en la barra de direcciones</li>
              <li>Seleccionar "Permitir" para acceder a la cámara</li>
              <li>Recargar la página</li>
            </ol>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (permissionState === 'prompt') {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="p-6 bg-gray-800 rounded-lg">
          <p className="text-white text-center mb-4">
            Se requiere acceso a la cámara para escanear códigos QR
          </p>
          <div className="flex justify-center">
            <button
              onClick={requestCameraPermission}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Permitir acceso a la cámara
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div id="qr-reader" className="rounded-lg overflow-hidden bg-gray-800" />
      <div className="p-4 bg-gray-800 rounded-lg space-y-2">
        <p className="text-center text-white font-medium">
          Centra el código QR en el recuadro para escanearlo
        </p>
        <p className="text-center text-gray-400 text-sm">
          Asegúrate de que el código esté bien iluminado y la cámara esté enfocada
        </p>
        <p className="text-center text-blue-400 text-xs">
          Tip: Usa el control de zoom si el código es pequeño o está lejos
        </p>
      </div>
    </div>
  );
};

export default QRScanner;