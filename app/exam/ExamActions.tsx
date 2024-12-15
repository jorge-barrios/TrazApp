// app/components/exam/ExamActions.tsx
import { useState } from 'react';
import { 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  PaperClipIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { type Exam, type ExamStatus } from '~/types/exam';
import ExamDetailsModal from './ExamDetailsModal';

interface ExamActionsProps {
  examId: string;
  status: ExamStatus;
  exam: Exam; // Cambiado de `any` a `Exam`
  onDelete?: () => void;
  onStatusChange?: (newStatus: ExamStatus) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function ExamActions({ 
  examId, 
  status,
  exam, 
  onDelete, 
  onStatusChange,
  canEdit = true,
  canDelete = true
}: ExamActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusActions, setShowStatusActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getNextStatus = (currentStatus: ExamStatus): ExamStatus => {
    const statusFlow = {
      'registered': 'collected',
      'collected': 'sent_to_lab',
      'sent_to_lab': 'in_analysis',
      'in_analysis': 'results_available',
      'results_available': 'completed',
      'completed': 'completed',
      'rejected': 'rejected', // No avanza más desde rechazado
    } as const;
    return statusFlow[currentStatus] || currentStatus;
  };

  const getPreviousStatus = (currentStatus: ExamStatus): ExamStatus => {
    const statusFlow = {
      'registered': 'registered',
      'collected': 'registered',
      'sent_to_lab': 'collected',
      'in_analysis': 'sent_to_lab',
      'results_available': 'in_analysis',
      'completed': 'results_available',
      'rejected': 'rejected', // No retrocede desde rechazado
    } as const;
    return statusFlow[currentStatus] || currentStatus;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Ver detalles - Ahora es un botón */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDetails(true);
          }}
          className="p-2 text-gray-400 hover:text-white rounded-lg 
            hover:bg-gray-700 transition-colors"
          title="Ver detalles"
        >
          <EyeIcon className="h-5 w-5" />
        </button>

        {/* Editar */}
        {canEdit && !['completed', 'rejected'].includes(status) && (
          <button
            className="p-2 text-gray-400 hover:text-white rounded-lg 
              hover:bg-gray-700 transition-colors"
            title="Editar"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
        )}

        {/* Estado */}
        <div className="relative">
          <button
            onClick={() => setShowStatusActions(!showStatusActions)}
            className="p-2 text-gray-400 hover:text-white rounded-lg 
              hover:bg-gray-700 transition-colors"
            title="Cambiar estado"
          >
            <DocumentDuplicateIcon className="h-5 w-5" />
          </button>

          {showStatusActions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg 
              bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                {status !== 'registered' && (
                  <button
                    onClick={() => {
                      onStatusChange?.(getPreviousStatus(status));
                      setShowStatusActions(false);
                    }}
                    className="block w-full px-4 py-2 text-sm text-gray-300 
                      hover:bg-gray-700 text-left"
                  >
                    Retroceder estado
                  </button>
                )}
                {status !== 'completed' && (
                  <button
                    onClick={() => {
                      onStatusChange?.(getNextStatus(status));
                      setShowStatusActions(false);
                    }}
                    className="block w-full px-4 py-2 text-sm text-gray-300 
                      hover:bg-gray-700 text-left"
                  >
                    Avanzar estado
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Imprimir */}
        <button
          className="p-2 text-gray-400 hover:text-white rounded-lg 
            hover:bg-gray-700 transition-colors"
          title="Imprimir"
        >
          <PrinterIcon className="h-5 w-5" />
        </button>

        {/* Adjuntos */}
        <button
          className="p-2 text-gray-400 hover:text-white rounded-lg 
            hover:bg-gray-700 transition-colors"
          title="Adjuntos"
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>

        {/* Eliminar */}
        {canDelete && (
          <button
            onClick={handleDelete}
            className="p-2 text-red-400 hover:text-red-300 rounded-lg 
              hover:bg-red-900/30 transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetails && (
        <ExamDetailsModal 
          exam={exam}
          onClose={() => setShowDetails(false)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50" onClick={cancelDelete}></div>
          <div className="relative bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <XMarkIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-medium text-white">
                Confirmar eliminación
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              ¿Está seguro que desea eliminar este examen? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm rounded-md bg-gray-700 text-white
                  hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white
                  hover:bg-red-500 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
