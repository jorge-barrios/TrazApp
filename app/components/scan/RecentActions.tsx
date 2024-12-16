import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BeakerIcon,
  DocumentCheckIcon,
  TruckIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';

interface RecentAction {
  status: string;
  created_at: string;
  notes?: string | null;
  exam: {
    id: string;
    exam_type: string;
    patient_name: string;
  };
  created_by_user: {
    full_name: string;
  };
}

interface RecentActionsProps {
  actions: RecentAction[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'registered':
      return ClockIcon;
    case 'collected':
      return BeakerIcon;
    case 'sent_to_lab':
      return TruckIcon;
    case 'in_analysis':
      return ArrowPathIcon;
    case 'results_available':
      return DocumentCheckIcon;
    case 'completed':
      return CheckCircleIcon;
    case 'rejected':
      return XCircleIcon;
    default:
      return ClockIcon;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'rejected':
      return 'text-red-500';
    case 'completed':
      return 'text-green-500';
    default:
      return 'text-blue-500';
  }
};

const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    'registered': 'Registrado',
    'collected': 'Muestra recolectada',
    'sent_to_lab': 'Enviado al laboratorio',
    'in_analysis': 'En análisis',
    'results_available': 'Resultados disponibles',
    'completed': 'Completado',
    'rejected': 'Rechazado'
  };
  return translations[status] || status;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace menos de un minuto';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
};

const shortenId = (id: string): string => {
  if (id.length <= 8) return id;
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
};

export default function RecentActions({ actions }: RecentActionsProps) {
  if (!actions.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        No hay acciones recientes
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {actions.map((action, actionIdx) => {
          const StatusIcon = getStatusIcon(action.status);
          const statusColor = getStatusColor(action.status);
          
          return (
            <li key={`${action.exam.id}-${action.created_at}`}>
              <div className="relative pb-8">
                {actionIdx !== actions.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-700"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-gray-900 ${statusColor} bg-gray-900`}
                    >
                      <StatusIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4">
                    <div>
                      <p className="text-sm text-white">
                        {translateStatus(action.status)}{' '}
                        <span className="font-medium text-gray-300">
                          {action.exam.patient_name}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 font-mono">
                        ID: {action.exam.id}
                      </p>
                      {action.notes && (
                        <p className="mt-1 text-sm text-gray-400">
                          {action.notes}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-500">
                        Por: {action.created_by_user.full_name}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-400">
                      <time dateTime={action.created_at}>
                        {formatTimeAgo(action.created_at)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
