import { XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black/50" onClick={handleCancel}></div>
      <div className="relative bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4 break-words" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <XMarkIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
          <h3 className="text-lg font-medium text-white">
            {title}
          </h3>
        </div>
        <p className="text-gray-300 mb-6 text-sm">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded-md bg-gray-700 text-white
              hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white
              hover:bg-red-500 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
