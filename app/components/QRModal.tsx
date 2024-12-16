import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: any;
  title?: string;
}

export default function QRModal({ isOpen, onClose, qrData, title = 'Código QR' }: QRModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const handleCopy = async () => {
    try {
      if (!qrRef.current) return;

      // Crear un canvas con dimensiones mayores para mejor calidad
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      const img = new Image();
      
      // Convertir SVG a una URL de datos
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Cuando la imagen se cargue, dibujarla en el canvas
      img.onload = async () => {
        // Usar dimensiones más grandes para mejor calidad
        const scale = 3; // Factor de escala para mejor resolución
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Configurar el contexto para mejor calidad
        if (ctx) {
          ctx.imageSmoothingEnabled = false; // Desactivar suavizado para QR nítido
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
        }
        
        try {
          // Convertir el canvas a blob con máxima calidad
          const blob = await new Promise<Blob>((resolve) => 
            canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0)
          );
          
          // Copiar la imagen al portapapeles
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Error al copiar la imagen:', err);
        }
        
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      console.error('Error al procesar la imagen:', err);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center mb-4"
                >
                  <h3 className="text-lg font-medium text-white">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      ref={qrRef}
                      value={JSON.stringify(qrData)}
                      size={400}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-5 w-5 text-green-500" />
                        <span>¡Imagen copiada!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="h-5 w-5" />
                        <span>Copiar imagen</span>
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
