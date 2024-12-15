// app/exam/ExamStatusTimeline.tsx
import { 
  ClockIcon, 
  CheckCircleIcon,
  DocumentCheckIcon,
  BeakerIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  XCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
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

const getStatusConfig = (status: string): { color: string; icon: any; bgColor: string } => {
  const normalizedStatus = status.toLowerCase().trim();
  
  const statusConfigs: Record<string, { color: string; icon: any; bgColor: string }> = {
    registered: { 
      color: 'text-gray-400',
      bgColor: 'bg-gray-800/50',
      icon: DocumentCheckIcon 
    },
    collected: { 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      icon: BeakerIcon 
    },
    sent_to_lab: { 
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      icon: TruckIcon 
    },
    in_analysis: { 
      color: 'text-blue-500',
      bgColor: 'bg-blue-900/30',
      icon: MagnifyingGlassIcon 
    },
    results_available: { 
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      icon: DocumentTextIcon 
    },
    completed: { 
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      icon: CheckCircleIcon 
    },
    rejected: { 
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      icon: XCircleIcon 
    },
    default: { 
      color: 'text-gray-400',
      bgColor: 'bg-gray-800/50',
      icon: ClockIcon 
    }
  };

  return statusConfigs[normalizedStatus] || statusConfigs.default;
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
    default: 'Estado desconocido'
  };

  return statusDisplay[status] || statusDisplay.default;
};

const TimelineItem = ({ event, isFirst, isLast }: TimelineItemProps) => {
  const config = getStatusConfig(event.status || 'default');
  const displayStatus = getStatusDisplay(event.status || 'default');
  const StatusIcon = config.icon;
  
  return (
    <div className="relative group">
      {/* Línea conectora vertical */}
      {!isLast && (
        <div className="absolute -left-10 top-6 bottom-0 w-0.5 bg-gray-700 group-hover:bg-gray-600 transition-colors"></div>
      )}

      {/* Punto e icono en la línea de tiempo */}
      <div 
        className={`absolute -left-10 w-8 h-8 rounded-full 
          ${config.bgColor} transform -translate-x-1/2
          flex items-center justify-center
          ring-2 ring-gray-700 group-hover:ring-gray-600
          transition-all duration-200 ease-in-out
          group-hover:scale-110`}
      >
        <StatusIcon className={`h-4 w-4 ${config.color}`} />
      </div>

      {/* Detalle del Evento */}
      <div className={`${config.bgColor} rounded-lg p-4 ml-6 
        border border-gray-700/50 group-hover:border-gray-600/50
        transition-all duration-200 ease-in-out
        group-hover:translate-x-1`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={`${config.color} font-medium text-lg`}>
              {displayStatus}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {formatDate(event.created_at)}
            </span>
          </div>
          
          {event.created_by && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <UserIcon className="h-4 w-4" />
              <span>{event.created_by_profile?.full_name || 'Usuario del Sistema'}</span>
              {event.created_by_profile?.role && (
                <span className="px-2 py-0.5 rounded-full bg-gray-700/50 text-xs">
                  {event.created_by_profile.role}
                </span>
              )}
            </div>
          )}
          
          {event.notes && (
            <p className={`text-sm mt-1 p-2 rounded ${config.bgColor} border border-gray-700/30`}>
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
    <div className="space-y-6">
      {/* Línea de Tiempo */}
      <div 
        className="relative pl-12 space-y-6"
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
