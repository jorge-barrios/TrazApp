// app/components/exam/ExamStatusBadge.tsx

import React, { FC } from 'react';
import { type ExamStatus } from '~/types/exam';
import { clsx } from 'clsx';

interface ExamStatusBadgeProps {
  status: ExamStatus;
}

const statusConfig = {
  registered: {
    label: 'Creado',
    className: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
  },
  collected: {
    label: 'Recolectado',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  sent_to_lab: {
    label: 'En Tránsito',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  in_analysis: {
    label: 'En Análisis',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  results_available: {
    label: 'Resultados por Registrar',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  completed: {
    label: 'Completado',
    className: 'bg-green-600/10 text-green-500 border-green-600/20',
  },
  rejected: {
    label: 'Rechazado',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
} as const;

const ExamStatusBadge: FC<ExamStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status as keyof typeof statusConfig];

  if (!config) {
    console.warn(`Estado desconocido: ${status}`);
    return (
      <span
        className={clsx(
          'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded border min-w-[120px] justify-center',
          'text-xs font-medium leading-tight whitespace-normal text-center min-h-[40px]',
          'bg-gray-500/10 text-gray-300 border-gray-500/20'
        )}
      >
        Desconocido
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded border min-w-[120px] justify-center',
        'text-xs font-medium leading-tight whitespace-normal text-center min-h-[40px]',
        config.className
      )}
    >
      {config.label}
    </span>
  );
};

export default ExamStatusBadge;
