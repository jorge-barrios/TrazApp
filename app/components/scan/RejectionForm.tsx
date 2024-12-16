import { useState } from 'react';
import { REJECTION_REASONS, type RejectionReason } from '~/types/exam';

interface RejectionFormProps {
  onSubmit: (reason: RejectionReason, additionalNotes: string) => void;
  onCancel: () => void;
}

const translateReason = (reason: RejectionReason): string => {
  const translations: Record<RejectionReason, string> = {
    'CONTAMINATED_SAMPLE': 'Muestra contaminada',
    'INSUFFICIENT_SAMPLE': 'Muestra insuficiente',
    'INCORRECT_CONTAINER': 'Contenedor incorrecto',
    'DAMAGED_CONTAINER': 'Contenedor dañado',
    'IMPROPER_STORAGE': 'Almacenamiento inadecuado',
    'EXPIRED_SAMPLE': 'Muestra vencida',
    'LABELING_ERROR': 'Error en etiquetado',
    'OTHER': 'Otro motivo'
  };
  return translations[reason];
};

export default function RejectionForm({ onSubmit, onCancel }: RejectionFormProps) {
  const [selectedReason, setSelectedReason] = useState<RejectionReason>('CONTAMINATED_SAMPLE');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedReason, additionalNotes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Motivo del rechazo
        </label>
        <select
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value as RejectionReason)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {REJECTION_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {translateReason(reason)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Notas adicionales
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Ingrese detalles adicionales sobre el rechazo..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
        >
          Confirmar rechazo
        </button>
      </div>
    </form>
  );
}
