import { XMarkIcon } from '@heroicons/react/24/solid';

interface BatchItem {
  id: string;
  examType: string;
  patientName: string;
  status: string;
  priority: string;
  timestamp: string;
}

interface BatchViewProps {
  items: BatchItem[];
  onClose: () => void;
}

const stateNames: Record<string, string> = {
  'registered': 'Registrado',
  'collected': 'Recolectado',
  'sent_to_lab': 'Enviado a laboratorio',
  'in_analysis': 'En análisis',
  'results_available': 'Resultados disponibles',
  'completed': 'Completado',
  'rejected': 'Rechazado'
};

export default function BatchView({ items, onClose }: BatchViewProps) {
  // Agrupar por tipo de examen y estado
  const groupedItems = items.reduce((acc, item) => {
    const key = `${item.examType}-${item.status}`;
    if (!acc[key]) {
      acc[key] = {
        examType: item.examType,
        status: item.status,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { examType: string; status: string; items: BatchItem[] }>);

  return (
    <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Resumen de lote ({items.length} muestras)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {Object.values(groupedItems).map(group => (
            <div
              key={`${group.examType}-${group.status}`}
              className="mb-6 last:mb-0"
            >
              <h3 className="text-lg font-medium text-white mb-3">
                {group.examType} - {stateNames[group.status]}
                <span className="ml-2 text-sm text-gray-400">
                  ({group.items.length})
                </span>
              </h3>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {group.items.map(item => (
                      <tr key={item.id} className="text-gray-300">
                        <td className="px-4 py-3 text-sm font-mono">
                          {item.id}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.patientName}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.priority}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
