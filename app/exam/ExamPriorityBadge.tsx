// app/components/exam/ExamPriorityBadge.tsx
import React, { FC } from 'react';

export type ExamPriority = 'normal' | 'urgente'; // Manteniendo 'urgente' como antes.

interface ExamPriorityBadgeProps {
  priority: ExamPriority;
}

const priorityConfig = {
  normal: {
    label: 'Normal',
    className: 'bg-gray-900 text-gray-200',
  },
  urgente: {
    label: 'Urgente',
    className: 'bg-red-900 text-red-200',
  },
} as const;

const ExamPriorityBadge: FC<ExamPriorityBadgeProps> = ({ priority }) => {
  const config = priorityConfig[priority];

  if (!config) {
    console.warn(`Prioridad desconocida: ${priority}`);
    return (
      <span className="px-2 py-1 inline-flex items-center justify-center rounded-full text-xs font-medium bg-gray-900 text-gray-400">
        Desconocida
      </span>
    );
  }

  return (
    <span
      className={`px-2 py-1 inline-flex items-center justify-center rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default ExamPriorityBadge;
