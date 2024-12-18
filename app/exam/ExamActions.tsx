// app/components/exam/ExamActions.tsx
import { 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from '@remix-run/react';
import { type Exam, type ExamStatus } from '~/types/exam';

interface ExamActionsProps {
  examId: string;
  status: ExamStatus;
  exam: Exam; 
  onDelete?: (e: React.MouseEvent) => void;
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
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(e);
    }
  };

  return (
    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      {/* View button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/exams/${examId}`);
        }}
        className="p-1 text-gray-400 hover:text-white transition-colors"
        title="Ver detalles"
      >
        <EyeIcon className="h-5 w-5" />
      </button>

      {/* Edit button */}
      {canEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/exams/${examId}/edit`);
          }}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="Editar"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
      )}

      {/* Delete button */}
      {canDelete && status === "registered" && (
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Eliminar"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}