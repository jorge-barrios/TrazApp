import { json } from '@remix-run/node';
import { useState, useEffect } from 'react';
import { useFetcher, useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import MainLayout from '~/components/layouts/MainLayout';
import QRScanner from '~/components/scan/QRScanner';
import ScanResult from '~/components/scan/ScanResult';
import RecentActions from '~/components/scan/RecentActions';
import ConfirmDialog from '~/components/scan/ConfirmDialog';
import BatchView from '~/components/scan/BatchView';
import type { RejectionReason } from '~/types/exam';
import { requireAuth } from '~/utils/auth.server';
import { createExamStatusHistory, getUserRecentActions, getExamCurrentStatus, undoLastExamStatusChange } from '~/utils/exam.server';

interface QRData {
  id: string;
  type: string;
  patient: string;
  priority: string;
}

interface ExamWithStatus extends QRData {
  status: string;
  nextState?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const { session, supabase } = await requireAuth(request);
  const recentActions = await getUserRecentActions(supabase, session.user.id, 10);
  return json({ recentActions });
};

export const action: ActionFunction = async ({ request }) => {
  const { session, supabase } = await requireAuth(request);
  const formData = await request.formData();
  const action = formData.get('action');
  const examId = formData.get('examId');
  
  if (!examId || typeof examId !== 'string') {
    return json({ error: 'ID de examen inválido' }, { status: 400 });
  }

  if (action === 'getStatus') {
    try {
      const examData = await getExamCurrentStatus(supabase, examId);
      if (!examData) {
        return json({ error: 'Examen no encontrado' }, { status: 404 });
      }
      return json({ examData });
    } catch (error) {
      return json({ error: 'Error al obtener el estado del examen' }, { status: 500 });
    }
  }

  if (action === 'undo') {
    try {
      const { previousStatus } = await undoLastExamStatusChange(supabase, examId);
      return json({ 
        success: true, 
        message: 'Estado revertido exitosamente',
        previousStatus 
      });
    } catch (error: any) {
      return json({ error: error.message }, { status: 400 });
    }
  }

  if (action === 'accept') {
    const status = formData.get('status');
    if (!status || typeof status !== 'string') {
      return json({ error: 'Estado inválido' }, { status: 400 });
    }

    await createExamStatusHistory(supabase, {
      examId,
      status,
      createdBy: session.user.id,
    });
    return json({ success: true });
  }

  if (action === 'reject') {
    const reason = formData.get('reason');
    const notes = formData.get('notes');

    if (!reason || typeof reason !== 'string') {
      return json({ error: 'Motivo de rechazo inválido' }, { status: 400 });
    }

    const rejectionNotes = `Motivo: ${reason}${notes ? `\nNotas adicionales: ${notes}` : ''}`;

    await createExamStatusHistory(supabase, {
      examId,
      status: 'rejected',
      createdBy: session.user.id,
      notes: rejectionNotes,
    });
    return json({ success: true });
  }

  return json({ error: 'Acción inválida' }, { status: 400 });
};

export default function ScanPage() {
  const { recentActions } = useLoaderData<{ recentActions: any[] }>();
  const [scanResult, setScanResult] = useState<ExamWithStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{ examId: string, status: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [batchItems, setBatchItems] = useState<Array<{
    id: string;
    examType: string;
    patientName: string;
    status: string;
    priority: string;
    timestamp: string;
  }>>([]);
  const [showBatchView, setShowBatchView] = useState(false);
  const fetcher = useFetcher();

  const getNextState = (currentState: string | null) => {
    const stateFlow = {
      'NULL': 'registered',
      'registered': 'collected',
      'collected': 'sent_to_lab',
      'sent_to_lab': 'in_analysis',
      'in_analysis': 'results_available',
      'results_available': 'completed'
    } as const;

    return stateFlow[currentState as keyof typeof stateFlow] || null;
  };

  const getStateTransitionMessage = (currentState: string, nextState: string) => {
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

    return `¿Deseas cambiar el estado de la muestra del examen ${scanResult?.type || ''} del paciente ${scanResult?.patient || ''}?\n\nEsto cambiará el estado de "${stateNames[currentState]}" a "${stateNames[nextState]}".`;
  };

  const handleScan = async (result: string) => {
    try {
      console.log('Trying to parse:', result);
      const data = JSON.parse(result) as QRData;
      
      if (!data.id || !data.type || !data.patient || !data.priority) {
        console.log('Missing required fields:', data);
        throw new Error('QR inválido: faltan campos requeridos');
      }

      // Obtener el estado actual del examen
      fetcher.submit(
        { 
          action: 'getStatus',
          examId: data.id
        },
        { method: 'post' }
      );

    } catch (err) {
      console.error('Error parsing QR:', err);
      setError('QR inválido o dañado');
    }
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      if (fetcher.data?.previousStatus) {
        setSuccess('Estado revertido exitosamente');
        setLastAction(null);
      } else {
        setSuccess('Estado actualizado exitosamente');
        // Guardar la última acción para poder deshacerla
        if (scanResult) {
          setLastAction({
            examId: scanResult.id,
            status: scanResult.status
          });
          // Agregar al lote
          setBatchItems(prev => [...prev, {
            id: scanResult.id,
            examType: scanResult.type,
            patientName: scanResult.patient,
            status: scanResult.status,
            priority: scanResult.priority,
            timestamp: new Date().toISOString()
          }]);
        }
      }
      setScanResult(null);
    } else if (fetcher.data?.examData) {
      const examData = fetcher.data.examData;
      const nextState = getNextState(examData.status);
      
      setError(null);
      setSuccess(null);
      setScanResult({
        id: examData.id,
        type: examData.exam_type,
        patient: examData.patient_name,
        priority: examData.priority,
        status: examData.status,
        nextState: nextState
      });
    } else if (fetcher.data?.error) {
      setError(fetcher.data.error);
      setSuccess(null);
      setScanResult(null);
    }
  }, [fetcher.data]);

  const handleReset = () => {
    setScanResult(null);
    setError(null);
    setSuccess(null);
  };

  const handleCloseBatch = () => {
    setShowBatchView(false);
  };

  const handleViewBatch = () => {
    setShowBatchView(true);
  };

  const handleClearBatch = () => {
    setBatchItems([]);
    setShowBatchView(false);
  };

  const handleAdvanceState = () => {
    if (!scanResult?.nextState) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmAdvance = () => {
    if (!scanResult?.nextState) return;
    
    fetcher.submit(
      { 
        action: 'accept',
        examId: scanResult.id,
        status: scanResult.nextState
      },
      { method: 'post' }
    );
    setShowConfirmDialog(false);
  };

  const handleCloseDialog = () => {
    setShowConfirmDialog(false);
  };

  const handleError = (error: string) => {
    setError(error);
  };

  const handleAccept = () => {
    if (!scanResult) return;
    
    fetcher.submit(
      { 
        action: 'accept',
        examId: scanResult.id,
        status: 'in_analysis'  // Siempre avanza a 'in_analysis' cuando se acepta
      },
      { method: 'post' }
    );
  };

  const handleReject = (reason: RejectionReason, notes: string) => {
    if (!scanResult) return;

    fetcher.submit(
      {
        action: 'reject',
        examId: scanResult.id,
        reason,
        notes
      },
      { method: 'post' }
    );
  };

  const handleUndo = () => {
    if (!lastAction) return;
    
    fetcher.submit(
      { 
        action: 'undo',
        examId: lastAction.examId
      },
      { method: 'post' }
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen p-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda: Scanner */}
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Escáner QR
                </h1>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">
                    Escanea el código QR del examen para actualizar su estado
                  </p>
                  {batchItems.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400">
                        {batchItems.length} muestras procesadas
                      </span>
                      <button
                        onClick={handleViewBatch}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Ver lote
                      </button>
                      <button
                        onClick={handleClearBatch}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Limpiar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg overflow-hidden">
                {error ? (
                  <div className="p-4">
                    <p className="text-red-200 mb-4">{error}</p>
                    <button
                      onClick={handleReset}
                      className="text-sm text-red-300 hover:text-red-200"
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                ) : success ? (
                  <div className="p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-green-400 text-lg mb-6">{success}</p>
                      <div className="space-y-3 w-full">
                        {lastAction && (
                          <button
                            onClick={handleUndo}
                            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Deshacer último cambio
                          </button>
                        )}
                        <button
                          onClick={handleReset}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Escanear otro
                        </button>
                      </div>
                    </div>
                  </div>
                ) : scanResult ? (
                  <ScanResult
                    result={JSON.stringify(scanResult)}
                    examData={{
                      examId: scanResult.id,
                      examType: scanResult.type,
                      patientName: scanResult.patient,
                      status: scanResult.status,
                      priority: scanResult.priority,
                      nextState: scanResult.nextState
                    }}
                    onReset={handleReset}
                    onAdvanceState={handleAdvanceState}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ) : (
                  <QRScanner
                    onResult={handleScan}
                    onError={handleError}
                  />
                )}
              </div>
            </div>

            {/* Columna derecha: Historial */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Acciones recientes
                </h2>
                <p className="text-gray-400">
                  Últimas actualizaciones de estado realizadas
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <RecentActions actions={recentActions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBatchView && (
        <BatchView
          items={batchItems}
          onClose={handleCloseBatch}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAdvance}
        title="Confirmar cambio de estado"
        message={scanResult ? getStateTransitionMessage(scanResult.status, scanResult.nextState || '') : ''}
      />
    </MainLayout>
  );
}