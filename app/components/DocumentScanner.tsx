import { useState } from "react";
import { createPortal } from "react-dom";

const ComingSoonModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
        <div className="text-center">
          {/* Icono animado */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 mb-6">
            <div className="relative">
              <svg 
                className="w-16 h-16 text-blue-500 animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-blue-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <h3 className="text-xl font-bold text-white mb-3">
            Función en Desarrollo
          </h3>
          <p className="text-gray-300 mb-6">
            Estamos trabajando en una nueva funcionalidad que te permitirá escanear documentos de identidad para autocompletar los datos del paciente de forma rápida y segura.
          </p>
          
          {/* Features futuros */}
          <div className="space-y-2 text-left mb-6">
            <p className="text-sm text-gray-400 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Reconocimiento automático de RUT
            </p>
            <p className="text-sm text-gray-400 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Extracción de nombres y apellidos
            </p>
            <p className="text-sm text-gray-400 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Validación automática de datos
            </p>
          </div>

          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const DocumentScanner = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors group"
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Escanear Documento
        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
          Pronto
        </span>
      </button>

      <ComingSoonModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
};
