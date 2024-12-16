// app/routes/exams.$id.tsx
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import MainLayout from "~/components/layouts/MainLayout";
import { formatLongDate } from "~/utils/dateFormatters";
import type { TimelineEvent } from "~/types/exam";
import ExamStatusBadge from "~/exam/ExamStatusBadge";
import ExamPriorityBadge from "~/exam/ExamPriorityBadge";
import ExamStatusTimeline from "~/exam/ExamStatusTimeline";
import {
  UserIcon,
  BeakerIcon,
  ClockIcon,
  InformationCircleIcon,
  XMarkIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { QrCodeIcon } from "@heroicons/react/24/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";

import { QRCodeSVG } from 'qrcode.react';

import { 
  translateSampleType, 
  translatePurpose, 
  translateOrgan,
  formatRut,
  formatPhone,
  formatAddress,
  translateClinicalStatus, 
  translateContraceptiveMethod, 
  translateCervixAppearance
} from "~/utils/translations";

interface ExamDetails {
  cervix_appearance?: string;
  menopause?: string;
  current_pregnancy?: string;
  contraceptive_method?: string;
  hpv_vaccine?: string;
  sample_type?: string;
  organ?: string;
}

interface ExamStatusHistory {
  id: string;
  exam_id: string;
  status: string;
  created_at: string;
  created_by: string;
  observations?: string;
}

interface Exam {
  id: string;
  node_id: string;
  patient_id: string | null;
  patient_name: string | null;
  exam_type: string;
  purpose: string;
  exam_details: ExamDetails;
  status: 'registered' | 'pending' | 'in_process' | 'completed';
  priority: string | null;
  observations: string | null;
  result_url: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  created_by: string;
  node?: {
    display_name: string;
    category: string;
  };
  patient?: {
    id: string;
    document_type: string;
    document_number: string;
    birth_date: string;
    gender: string;
    full_name: string;
    nationality: string;
    health_insurance: string;
    other_health_insurance?: string;
    phone: string;
    region: string;
    commune: string;
    address: string;
  };
  status_history?: ExamStatusHistory[];
}

interface LoaderData {
  exam: Exam;
  statusHistory: TimelineEvent[];
  userCanEdit: boolean;
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

export const loader: LoaderFunction = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    throw new Response("ID de examen no proporcionado", { status: 400 });
  }

  try {
    const { supabase, response } = await requireAuth(request);
    
    // Debug: Verificar el ID que estamos buscando
    console.log("ID del examen a buscar:", id);

    // Primero verifiquemos si el examen existe sin joins
    const { data: examExists, error: examExistsError } = await supabase
      .from("exams")
      .select("id")
      .eq("id", id)
      .single();

    if (examExistsError) {
      console.error("Error verificando existencia del examen:", examExistsError);
      throw new Response("Error al verificar el examen", { status: 500 });
    }

    if (!examExists) {
      console.log("Examen no encontrado en la base de datos");
      throw new Response("Examen no encontrado", { status: 404 });
    }

    // Si llegamos aquí, el examen existe, ahora intentemos la consulta completa
    const { data: examQuery, error: examError } = await supabase
      .from("exams")
      .select(`
        *,
        node:nodes (
          display_name,
          category
        )
      `)
      .eq("id", id)
      .single();

    console.log("Exam Query completo:", JSON.stringify(examQuery, null, 2));
    console.log("Exam details:", JSON.stringify(examQuery?.exam_details, null, 2));
    console.log("Resultado de la consulta del examen:", examQuery);
    console.log("Error de la consulta si existe:", examError);

    if (examError) {
      console.error("Error al cargar examen:", examError);
      throw new Response("Error al cargar el examen", { status: 500 });
    }

    if (!examQuery) {
      throw new Response("Examen no encontrado", { status: 404 });
    }

    // Si hay patient_id, intentar cargar los datos del paciente
    let patientData = null;
    if (examQuery.patient_id) {
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", examQuery.patient_id)
        .single();

      if (patientError) {
        console.error("Error al cargar datos del paciente:", patientError);
      } else {
        patientData = patient;
      }
    }

    // Combinar los datos
    const examData = {
      ...examQuery,
      patient: patientData
    };

    // Verificar permisos
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Response("Error de autenticación", { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role, node_id")
      .eq("user_id", user.id)
      .single();

    const userCanEdit = userProfile?.role === "admin" || userProfile?.node_id === examQuery.node_id;

    // Cargar historial
    const { data: statusHistory, error: historyError } = await supabase
      .from("exam_status_history")
      .select(`
        id,
        exam_id,
        status,
        created_at,
        created_by,
        notes,
        created_by_profile:profiles!created_by (
          full_name,
          role
        )
      `)
      .eq("exam_id", id)
      .order("created_at", { ascending: true });

    // Obtener el perfil del creador del examen
    const { data: creatorProfile } = await supabase
      .from("profiles")
      .select(`
        full_name,
        role
      `)
      .eq("user_id", examData.created_by)
      .single();

    const fullHistory = [
      {
        id: examData.id,
        exam_id: examData.id,
        status: "registered",
        created_at: examData.created_at,
        created_by: examData.created_by,
        notes: "El examen fue registrado en el sistema",
        created_by_profile: creatorProfile
      },
      ...(statusHistory || []),
    ];

    return json(
      {
        exam: examData,
        statusHistory: fullHistory,
        userCanEdit
      },
      {
        headers: response.headers,
      }
    );

  } catch (error) {
    console.error("Error loading exam:", error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response(
      error instanceof Error ? error.message : "Error interno del servidor", 
      { status: 500 }
    );
  }
};

interface DetailCardProps {
  icon: React.ComponentType<any>;
  title: string;
  children: React.ReactNode;
  colorClass?: string;
}

const DetailCard = ({
  icon: Icon,
  title,
  children,
  colorClass = "bg-blue-600",
}: DetailCardProps) => (
  <div className="bg-gray-800/40 p-6 rounded-lg">
    <div className="flex items-center space-x-4 mb-4">
      <div className={`p-3 ${colorClass} rounded-full`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const InfoItem = ({
  label,
  value,
  className = "",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<any>;
}) => (
  <div className={`flex justify-between items-center ${className}`}>
    <dt className="text-sm text-gray-400">{label}</dt>
    {icon && (
      <div className="mr-2">
        <icon className="h-5 w-5 text-gray-400" />
      </div>
    )}
    <dd className="text-white">
      {value || <span className="text-gray-500 italic">No especificado</span>}
    </dd>
  </div>
);

const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    'registered': 'Registrado',
    'pending': 'Pendiente',
    'in_process': 'En Proceso',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  };
  return translations[status] || status;
};

import { useState } from "react";
import QRModal from "~/components/QRModal";

export default function ExamDetails() {
  const { exam, statusHistory, userCanEdit } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isModal = searchParams.get("modal") === "true";
  const [showQRModal, setShowQRModal] = useState(false);

  const qrData = {
    id: exam.id,
    type: exam.exam_type,
    patient: exam.patient?.full_name || exam.patient_name,
    priority: exam.priority
  };

  const handleClose = () => {
    if (isModal) {
      window.parent.postMessage({ type: "CLOSE_MODAL" }, "*");
    } else {
      navigate("/exams");
    }
  };

  const content = (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6">
        {/* Header con QR */}
        <div className="flex justify-between items-center bg-gray-800/40 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-6">
            {/* QR Code */}
            <button 
              onClick={() => setShowQRModal(true)}
              className="bg-white p-2 rounded-lg hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
              title="Click para ampliar"
            >
              <QRCodeSVG
                value={JSON.stringify(qrData)}
                size={80}
                level="H"
                includeMargin={false}
              />
            </button>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Examen #{exam.id}
                <button 
                  onClick={() => navigator.clipboard.writeText(exam.id)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                  title="Copiar ID"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </button>
              </h1>
              <div className="flex items-center gap-3">
                <ExamStatusBadge status={exam.status} />
                <ExamPriorityBadge priority={exam.priority || "normal"} />
                <span className="text-sm text-gray-400">
                  Última actualización: {formatLongDate(exam.updated_at)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Cerrar detalles"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Historial de Estados (más ancho) */}
          <div className="lg:col-span-7 space-y-6">
            <DetailCard
              icon={ClockIcon}
              title="Historial de Estados"
              colorClass="bg-yellow-600"
            >
              <div>
                <ExamStatusTimeline history={statusHistory} />
              </div>
            </DetailCard>
          </div>

          {/* Panel lateral derecho */}
          <div className="lg:col-span-5 space-y-6">
            {/* Info del paciente */}
            <DetailCard
              icon={UserIcon}
              title="Datos del Paciente"
              colorClass="bg-blue-600"
            >
              <div className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3 border-b border-gray-700 pb-1">
                    Información Personal
                  </h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <InfoItem 
                      label="Nombre" 
                      value={exam.patient?.full_name || exam.patient_name} 
                      className="col-span-2"
                    />
                    <InfoItem 
                      label="RUT" 
                      value={formatRut(exam.patient?.document_number)}
                    />
                    <InfoItem 
                      label="Edad" 
                      value={exam.patient?.birth_date ? `${calculateAge(exam.patient.birth_date)} años` : 'No disponible'} 
                    />
                    <InfoItem 
                      label="Género" 
                      value={exam.patient?.gender === 'female' ? 'Femenino' : 'Masculino'} 
                    />
                    <InfoItem 
                      label="Previsión" 
                      value={exam.patient?.health_insurance || 'No especificada'} 
                    />
                  </dl>
                </div>

                {/* Información de Contacto */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3 border-b border-gray-700 pb-1">
                    Información de Contacto
                  </h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <InfoItem 
                      label="Teléfono"
                      value={formatPhone(exam.patient?.phone)}
                      icon={PhoneIcon}
                      className="col-span-2"
                    />
                    <InfoItem 
                      label="Dirección"
                      value={formatAddress(
                        exam.patient?.address,
                        exam.patient?.commune,
                        exam.patient?.region
                      )}
                      icon={MapPinIcon}
                      className="col-span-2"
                    />
                  </dl>
                </div>
              </div>
            </DetailCard>

            {/* Detalles del Examen */}
            <DetailCard
              icon={BeakerIcon}
              title="Datos del Examen"
              colorClass="bg-green-600"
            >
              <dl className="grid grid-cols-2 gap-4">
                <InfoItem 
                  label="Tipo" 
                  value="PAP"
                />
                <InfoItem 
                  label="Propósito" 
                  value={translatePurpose(exam.purpose)}
                />
                <InfoItem 
                  label="Órgano" 
                  value={(() => {
                    // Intentar parsear exam_details si es string
                    let details = exam.exam_details;
                    if (typeof details === 'string') {
                      try {
                        details = JSON.parse(details);
                      } catch (e) {
                        console.error('Error parsing exam_details:', e);
                      }
                    }
                    return translateOrgan((details as any)?.organ || 'No especificado');
                  })()}
                  className="col-span-2"
                />
                {exam.observations && (
                  <InfoItem 
                    label="Observaciones" 
                    value={exam.observations}
                    className="col-span-2"
                  />
                )}
              </dl>
            </DetailCard>
          </div>
        </div>
      </div>
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrData={qrData}
        title={`Código QR - Examen #${exam.id}`}
      />
    </div>
  );

  if (isModal) {
    return content;
  }

  return <MainLayout>{content}</MainLayout>;
}

export function ErrorBoundary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isModal = searchParams.get("modal") === "true";

  const error = (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-900/20 mb-4">
          <XMarkIcon className="h-6 w-6 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Error al cargar el examen
        </h1>
        
        <p className="text-gray-300 mb-6">
          No se pudo cargar la información del examen solicitado. Esto puede deberse a que el examen no existe o no tienes permisos para acceder a él.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              if (isModal) {
                window.parent.postMessage({ type: "CLOSE_MODAL" }, "*");
              } else {
                navigate("/exams");
              }
            }}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver al listado
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Regresar a la página anterior
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Si el problema persiste, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );

  if (isModal) {
    return error;
  }

  return <MainLayout>{error}</MainLayout>;
}