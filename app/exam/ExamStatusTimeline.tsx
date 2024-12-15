// app/components/exam/ExamStatusTimeline.tsx
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatDate } from '~/utils/dateFormatters';
import type { TimelineEvent } from '~/types/exam';

interface ExamStatusTimelineProps {
  history: TimelineEvent[];
}

interface TimelineItemProps {
  event: TimelineEvent;
  isFirst: boolean;
  isLast: boolean;
}

const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().trim();
  
  const statusColors: Record<string, string> = {
    registered: 'border-gray-500',
    collected: 'border-yellow-500',
    sent_to_lab: 'border-blue-400',
    in_analysis: 'border-blue-500',
    results_available: 'border-purple-500',
    completed: 'border-green-500',
    rejected: 'border-red-500',
    default: 'border-gray-400', // Fallback
  };

  return statusColors[normalizedStatus] || statusColors.default;
};

const getStatusDisplay = (status: string): string => {
  const statusDisplay: Record<string, string> = {
    registered: 'Registrado',
    collected: 'Recolectado',
    sent_to_lab: 'Enviado al Laboratorio',
    in_analysis: 'En Análisis',
    results_available: 'Resultados Disponibles',
    completed: 'Completado',
    rejected: 'Rechazado',
    default: 'Estado desconocido', // Fallback
  };

  return statusDisplay[status] || statusDisplay.default;
};

const TimelineItem = ({ event, isFirst, isLast }: TimelineItemProps) => {
  const borderColor = getStatusColor(event.status || 'default');
  const displayStatus = getStatusDisplay(event.status || 'default');
  
  return (
    <div className="relative">
      {/* Línea conectora vertical */}
      {!isLast && (
        <div className="absolute -left-10 top-4 bottom-0 w-0.5 bg-gray-700"></div>
      )}

      {/* Punto en la línea de tiempo */}
      <div 
        className={`absolute -left-10 w-4 h-4 rounded-full border-2 
          ${borderColor} bg-gray-900 transform -translate-x-1/2
          flex items-center justify-center`}
      >
        {isFirst && (event.status === 'completed') && (
          <CheckCircleIcon className={`h-3 w-3 ${borderColor.replace('border', 'text')}`} />
        )}
      </div>

      {/* Detalle del Evento */}
      <div className="bg-gray-800/50 rounded-lg p-4 ml-6">
        <div className="flex flex-col gap-1">
          <span className="text-white font-medium">
            {displayStatus}
          </span>
          <span className="text-sm text-gray-400">
            {formatDate(event.created_at)}
          </span>
          {event.created_by && (
            <span className="text-sm text-gray-400">
              Realizado por: {event.created_by_profile?.full_name || 'Usuario del Sistema'}
              {event.created_by_profile?.role && ` (${event.created_by_profile.role})`}
            </span>
          )}
          {event.notes && (
            <p className={`text-sm mt-2 p-2 rounded ${
              event.status === 'rejected' 
                ? 'text-red-400 bg-red-900/20' 
                : 'text-gray-500 italic'
            }`}>
              {event.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ExamStatusTimeline({ history }: ExamStatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-gray-400 text-sm italic text-center p-4">
        No hay historial de estados disponible.
      </div>
    );
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center gap-2 mb-6">
        <ClockIcon className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-medium text-white">
         Historial de Estados
        </h3>
      </div>

      {/* Línea de Tiempo */}
      <div 
        className="relative pl-12 space-y-8"
        role="list"
        aria-label="Historial de estados del examen"
      >
        {sortedHistory.map((event, index) => (
          <TimelineItem
            key={event.id || index}
            event={event}
            isFirst={index === 0}
            isLast={index === sortedHistory.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-700 rounded"></div>
      <div className="space-y-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-4">
            <div className="w-4 h-4 rounded-full bg-gray-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
