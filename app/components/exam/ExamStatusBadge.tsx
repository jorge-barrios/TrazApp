// app/components/exam/ExamStatusBadge.tsx
import { FC } from 'react';
import { type ExamStatus } from '~/types/exam';

interface ExamStatusBadgeProps {
  status: ExamStatus;
}

const statusConfig = {
  registered: {
    label: 'Registrado',
    className: 'bg-gray-700 text-gray-100'
  },
  pending: {
    label: 'Pendiente',
    className: 'bg-yellow-800/60 text-yellow-200'
  },
  in_process: {
    label: 'En Proceso',
    className: 'bg-blue-800/60 text-blue-200'
  },
  completed: {
    label: 'Completado',
    className: 'bg-green-800/60 text-green-200'
  }
} as const;

const ExamStatusBadge: FC<ExamStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  
  return (
    <span className={`px-3 py-1 inline-flex items-center justify-center rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default ExamStatusBadge;