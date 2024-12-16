import { useState } from 'react';
import type { RejectionReason } from '~/types/exam';

interface ExamData {
  examId: string;
  examType: string;
  patientName: string;
  status: string;
  priority: string;
  nextState?: string;
}

interface ScanResultProps {
  result: string;
  examData: ExamData;
  onReset: () => void;
  onAdvanceState: () => void;
  onAccept: () => void;
  onReject: (reason: RejectionReason, notes: string) => void;
}

const ScanResult = ({ result, examData, onReset, onAdvanceState, onAccept, onReject }: ScanResultProps) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectionReason>('damaged');
  const [rejectNotes, setRejectNotes] = useState('');

  const stateNames = {
    'NULL': 'No registrado',
    'registered': 'Registrado',
    'collected': 'Recolectado',
    'sent_to_lab': 'Enviado a laboratorio',
    'in_analysis': 'En análisis',
    'results_available': 'Resultados disponibles',
    'completed': 'Completado',
    'rejected': 'Rechazado'
  };

  const handleReject = () => {
    onReject(rejectReason, rejectNotes);
    setShowRejectForm(false);
    setRejectNotes('');
  };

  const renderRejectForm = () => (
    <div className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Motivo del rechazo
        </label>
        <select
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value as RejectionReason)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="damaged">Muestra dañada</option>
          <option value="incorrect_labeling">Etiquetado incorrecto</option>
          <option value="contaminated">Muestra contaminada</option>
          <option value="insufficient">Muestra insuficiente</option>
          <option value="other">Otro</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notas adicionales
        </label>
        <textarea
          value={rejectNotes}
          onChange={(e) => setRejectNotes(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          rows={3}
          placeholder="Ingrese detalles adicionales..."
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleReject}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Confirmar rechazo
        </button>
        <button
          onClick={() => setShowRejectForm(false)}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Resultado del escaneo
      </h2>

      <div className="space-y-3 mb-6">
        <div>
          <h3 className="text-sm text-gray-400">ID</h3>
          <p className="text-white">{examData.examId}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Paciente</h3>
          <p className="text-white">{examData.patientName}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Tipo de examen</h3>
          <p className="text-white">{examData.examType}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Estado actual</h3>
          <p className="text-white">{stateNames[examData.status as keyof typeof stateNames] || examData.status}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Prioridad</h3>
          <p className="text-white">{examData.priority}</p>
        </div>
      </div>

      <div className="space-y-3">
        {examData.status === 'sent_to_lab' ? (
          <>
            <button
              onClick={onAccept}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Aceptar muestra
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Rechazar muestra
            </button>
          </>
        ) : examData.nextState && examData.status !== 'sent_to_lab' ? (
          <button
            onClick={onAdvanceState}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Avanzar a {stateNames[examData.nextState as keyof typeof stateNames]}
          </button>
        ) : null}

        {showRejectForm && renderRejectForm()}

        <button
          onClick={onReset}
          className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          Escanear otro
        </button>
      </div>
    </div>
  );
};

export default ScanResult;
