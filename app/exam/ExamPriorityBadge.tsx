// app/components/exam/ExamPriorityBadge.tsx
import React, { FC } from 'react';
import { clsx } from 'clsx';

export type ExamPriority = 'normal' | 'urgente'; // Manteniendo 'urgente' como antes.

interface ExamPriorityBadgeProps {
  priority: ExamPriority;
}

const priorityConfig = {
  normal: {
    label: 'Normal',
    className: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
  },
  urgente: {
    label: 'Urgente',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
} as const;

const ExamPriorityBadge: FC<ExamPriorityBadgeProps> = ({ priority }) => {
  const config = priorityConfig[priority];

  if (!config) {
    console.warn(`Prioridad desconocida: ${priority}`);
    return (
      <span
        className={clsx(
          'inline-flex items-center px-2.5 py-1 rounded border min-w-[120px] justify-center',
          'text-xs font-medium leading-tight whitespace-normal text-center min-h-[40px]',
          'bg-gray-500/10 text-gray-300 border-gray-500/20'
        )}
      >
        Desconocida
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

export default ExamPriorityBadge;
