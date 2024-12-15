// app/components/exam/ExamContent.tsx
import { DetailCard, InfoItem } from "~/components/ui/DataDisplay";
import ExamStatusBadge from "~/exam/ExamStatusBadge";
import ExamPriorityBadge from "~/exam/ExamPriorityBadge";
import ExamStatusTimeline from "~/exam/ExamStatusTimeline";
import { formatLongDate } from "~/utils/dateFormatters";
import type { Exam, TimelineEvent } from "~/types/exam";
import {
  InformationCircleIcon,
  XMarkIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { QRCodeSVG } from 'qrcode.react';

interface ExamContentProps {
  exam: Exam;
  statusHistory: TimelineEvent[];
  userCanEdit: boolean;
  onClose: () => void;
  isModal?: boolean;
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function ExamContent({ 
  exam, 
  statusHistory, 
  userCanEdit, 
  onClose,
  isModal = false 
}: ExamContentProps) {
  // Extraer detalles del examen
  const examDetails = exam.exam_details || {};

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6">
        {/* Header compacto */}
        <div className="flex justify-between items-center bg-gray-800/40 p-4 rounded-lg mb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-white">
              Examen #{exam.id.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-3">
              <ExamStatusBadge status={exam.status} />
              <ExamPriorityBadge priority={exam.priority || "normal"} />
              <span className="text-sm text-gray-400">
                Última actualización: {formatLongDate(exam.updated_at)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Cerrar detalles"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info del paciente y examen */}
          <div className="space-y-6">
            <DetailCard
              icon={InformationCircleIcon}
              title="Información"
              colorClass="bg-blue-600"
            >
              <dl className="space-y-4">
                <InfoItem 
                  label="Nombre" 
                  value={exam.patient?.full_name || exam.patient_name} 
                />
                <InfoItem 
                  label="RUT" 
                  value={exam.patient?.document_number} 
                />
                <InfoItem
                  label="Edad"
                  value={exam.patient?.birth_date ? `${calculateAge(exam.patient.birth_date)} años` : null}
                />
                <InfoItem 
                  label="Género" 
                  value={
                    exam.patient?.gender === 'female' ? 'Femenino' : 
                    exam.patient?.gender === 'male' ? 'Masculino' : 
                    exam.patient?.gender || null
                  } 
                />

                {/* Información de contacto */}
                <div className="border-t border-gray-700 my-4" />
                <InfoItem label="Teléfono" value={exam.patient?.phone} />
                <InfoItem label="Región" value={exam.patient?.region} />
                <InfoItem label="Comuna" value={exam.patient?.commune} />
                <InfoItem label="Dirección" value={exam.patient?.address} />

                {/* Información del examen */}
                <div className="border-t border-gray-700 my-4" />
                <InfoItem label="Tipo de Examen" value={exam.exam_type} />
                <InfoItem label="Centro" value={exam.node?.display_name} />
                <InfoItem 
                  label="Previsión" 
                  value={
                    exam.patient?.health_insurance === 'other' 
                      ? exam.patient?.other_health_insurance 
                      : exam.patient?.health_insurance
                  } 
                />

                {/* Detalles específicos del examen */}
                {Object.entries(examDetails).map(([key, value]) => (
                  <InfoItem 
                    key={key}
                    label={key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1)}
                    value={value}
                  />
                ))}

                {exam.observations && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-400">Observaciones</span>
                    <p className="mt-1 text-white text-sm bg-gray-700/50 p-2 rounded">
                      {exam.observations}
                    </p>
                  </div>
                )}
              </dl>
            </DetailCard>

            {userCanEdit && exam.status !== "completed" && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Editar Examen
              </button>
            )}
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <DetailCard
              icon={QrCodeIcon}
              title="Seguimiento"
              colorClass="bg-indigo-600"
            >
              <div className="space-y-6">
                {/* QR Code */}
                <div className="flex flex-col items-center p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={JSON.stringify({
                      id: exam.id,
                      type: exam.exam_type,
                      patient: exam.patient_name,
                      status: exam.status
                    })}
                    size={200}
                    level="H"
                    includeMargin
                    className="mb-2"
                  />
                  <p className="text-gray-900 text-sm font-medium">
                    Código QR del Examen #{exam.id.slice(0, 8)}
                  </p>
                </div>
                {/* Timeline */}
                <ExamStatusTimeline history={statusHistory} />
              </div>
            </DetailCard>
          </div>
        </div>
      </div>
    </div>
  );
}