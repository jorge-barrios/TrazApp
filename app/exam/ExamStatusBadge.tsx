// app/components/exam/ExamStatusBadge.tsx

import React, { FC } from 'react';
import { type ExamStatus } from '~/types/exam';

interface ExamStatusBadgeProps {
  status: ExamStatus;
}

const statusConfig = {
  registered: {
    label: 'Registrado',
    className: 'bg-gray-700 text-gray-100',
  },
  collected: {
    label: 'Recolectado',
    className: 'bg-yellow-800/60 text-yellow-200',
  },
  sent_to_lab: {
    label: 'Enviado al Laboratorio',
    className: 'bg-blue-700/60 text-blue-200',
  },
  in_analysis: {
    label: 'En Análisis',
    className: 'bg-indigo-800/60 text-indigo-200',
  },
  results_available: {
    label: 'Resultados Disponibles',
    className: 'bg-purple-800/60 text-purple-200',
  },
  completed: {
    label: 'Completado',
    className: 'bg-green-800/60 text-green-200',
  },
  rejected: {
    label: 'Rechazado',
    className: 'bg-red-800/60 text-red-200',
  },
} as const;

const ExamStatusBadge: FC<ExamStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  if (!config) {
    console.warn(`Estado desconocido: ${status}`);
    return (
      <span className="px-3 py-1 inline-flex items-center justify-center rounded-full text-sm font-medium bg-gray-700 text-gray-300">
        Desconocido
      </span>
    );
  }

  return (
    <span className={`px-3 py-1 inline-flex items-center justify-center rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default ExamStatusBadge;
