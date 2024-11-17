// Archivo: /app/routes/scan.tsx
import { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import MainLayout from '~/components/layouts/MainLayout';
import QRScanner from '~/components/scan/QRScanner';
import ScanResult from '~/components/scan/ScanResult';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleScan = (result: string) => {
    setScanResult(result);
    // TODO: Validar el formato del QR
  };

  const handleError = (error: string) => {
    setError(error);
  };

  const handleReset = () => {
    setScanResult(null);
    setError(null);
  };

  const handleConfirm = () => {
    // TODO: Procesar el resultado y actualizar el estado del examen
    navigate('/dashboard');
  };

  return (
    <MainLayout>
      <div className="min-h-screen p-6 bg-gray-900">
        {/* Header */}
        <div className="max-w-lg mx-auto mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Escáner QR
          </h1>
          <p className="text-gray-400">
            Escanea el código QR del examen para actualizar su estado
          </p>
        </div>

        {/* Scanner o Resultado */}
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="max-w-lg mx-auto mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {scanResult ? (
            <ScanResult
              result={scanResult}
              isValid={true} // TODO: Implementar validación real
              onReset={handleReset}
              onConfirm={handleConfirm}
            />
          ) : (
            <QRScanner
              onResult={handleScan}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}