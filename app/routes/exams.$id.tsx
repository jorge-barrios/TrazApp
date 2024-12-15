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
} from "@heroicons/react/24/outline";
import { QrCodeIcon } from "@heroicons/react/24/solid";

import { QRCodeSVG } from 'qrcode.react';

interface Exam {
  id: string;
  node_id: string;
  patient_id: string | null;
  patient_name: string | null;
  exam_type: string;
  exam_details: {
    [key: string]: any;
  } | null;
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

    const fullHistory = [
      {
        id: examData.id,
        exam_id: examData.id,
        status: "registered",
        created_at: examData.created_at,
        created_by: examData.created_by,
        notes: "El examen fue registrado en el sistema",
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
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex justify-between items-center ${className}`}>
    <dt className="text-sm text-gray-400">{label}</dt>
    <dd className="text-white">
      {value || <span className="text-gray-500 italic">No especificado</span>}
    </dd>
  </div>
);

export default function ExamDetails() {
  const { exam, statusHistory, userCanEdit } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isModal = searchParams.get("modal") === "true";

  const handleClose = () => {
    if (isModal) {
      window.parent.postMessage({ type: "CLOSE_MODAL" }, "*");
    } else {
      navigate("/exams");
    }
  };

  // Extraer detalles del examen
  const examDetails = exam.exam_details || {};

  const content = (
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
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Cerrar detalles"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: QR Code and Info */}
          <div className="space-y-6">
            {/* QR Code */}
            <DetailCard
              icon={QrCodeIcon}
              title="Código QR del Examen"
              colorClass="bg-purple-600"
            >
              <div className="flex flex-col items-center p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: exam.id,
                    type: exam.exam_type,
                    patient: exam.patient?.full_name || exam.patient_name,
                    status: exam.status,
                    priority: exam.priority
                  })}
                  size={160}
                  level="H"
                  includeMargin
                  className="mb-2"
                />
                <p className="text-gray-900 text-sm font-medium mt-2">
                  ID: {exam.id.slice(0, 8)}
                </p>
              </div>
            </DetailCard>

            {/* Info del paciente y examen */}
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

                {exam.status === "rejected" && (
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mt-4">
                    <h4 className="text-red-400 font-medium mb-2">
                      Examen Rechazado
                    </h4>
                    <p className="text-sm text-red-300">
                      No se pudo procesar el examen. Contactar al laboratorio
                      para más detalles.
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
              icon={ClockIcon}
              title="Seguimiento"
              colorClass="bg-indigo-600"
            >
              <ExamStatusTimeline history={statusHistory} />
            </DetailCard>
          </div>
        </div>
      </div>
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