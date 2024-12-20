// app/routes/exams._index.tsx

import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useRevalidator, Form, useSubmit } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import MainLayout from "~/components/layouts/MainLayout";
import ExamTable from "~/exam/ExamTable";
import ExamDetailsModal from "~/exam/ExamDetailsModal";
import InfoCard from "~/components/ui/InfoCard";
import type { Exam } from "~/types/exam";
import { useRouteError } from "@remix-run/react";
import {
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import ConfirmationModal from "~/components/ConfirmationModal";

interface LoaderData {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    full_name: string;
    role: string;
    node_id: string;
    node: {
      display_name: string;
      category: string;
    };
  };
  exams: Exam[];
  stats: {
    total: number;
    registered: number;
    collected: number;
    sentToLab: number;
    inAnalysis: number;
    resultsAvailable: number;
    completed: number;
    rejected: number;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { session, response, supabase } = await requireAuth(request);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        node:nodes (
          display_name,
          category
        )
      `)
      .eq("user_id", session.user.id)
      .single();

    if (profileError) {
      console.error("Error loading profile:", profileError);
      throw new Response("Error al cargar el perfil de usuario", { status: 400 });
    }

    let examsQuery = supabase
      .from("exams")
      .select(`
        *,
        node:nodes (
          display_name,
          category
        ),
        patient:patients!exams_patient_id_fkey (
          document_number
        )
      `)
      .order("created_at", { ascending: false });

    if (profile.role !== "admin") {
      examsQuery = examsQuery.eq("node_id", profile.node_id);
    }

    const { data: exams, error: examsError } = await examsQuery;

    if (examsError) {
      console.error("Error loading exams:", examsError);
      throw new Response("Error al cargar los exámenes", { status: 400 });
    }

    const stats = {
      total: exams?.length || 0,
      registered: exams?.filter((exam) => exam.status === "registered").length || 0,
      collected: exams?.filter((exam) => exam.status === "collected").length || 0,
      sentToLab: exams?.filter((exam) => exam.status === "sent_to_lab").length || 0,
      inAnalysis: exams?.filter((exam) => exam.status === "in_analysis").length || 0,
      resultsAvailable: exams?.filter((exam) => exam.status === "results_available").length || 0,
      completed: exams?.filter((exam) => exam.status === "completed").length || 0,
      rejected: exams?.filter((exam) => exam.status === "rejected").length || 0,
    };

    return json(
      {
        user: session.user,
        profile,
        exams: exams || [],
        stats,
      },
      {
        headers: response.headers,
      }
    );
  } catch (error) {
    console.error("Error in exams loader:", error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response("Error interno del servidor", { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  console.log("Action ejecutándose...");
  const { supabase, response } = await requireAuth(request);
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return json({ error: "Error de autenticación" }, { 
      status: 401,
      headers: response.headers 
    });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const examId = formData.get("examId");
    
    // Verificar el rol y nodo del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, node_id")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      return json({ error: "Error al verificar permisos" }, { 
        status: 400,
        headers: response.headers 
      });
    }

    // Verificar que el examen exista y obtener sus datos
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("node_id, created_by, status")
      .eq("id", examId)
      .single();

    if (examError) {
      return json({ error: "Error al verificar el examen" }, { 
        status: 400,
        headers: response.headers 
      });
    }

    // Verificar permisos según el rol
    const canDelete = profile.role === 'admin' 
      ? profile.node_id === exam.node_id
      : (
        profile.node_id === exam.node_id &&
        exam.created_by === user.id &&
        exam.status === 'registered'
      );

    if (!canDelete) {
      return json({ 
        error: profile.role === 'admin' 
          ? "Solo puedes eliminar exámenes de tu nodo" 
          : "Solo puedes eliminar tus propios exámenes en estado registrado"
      }, { 
        status: 403,
        headers: response.headers 
      });
    }
    
    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", examId);

      if (error) {
        return json({ error: "Error al eliminar el examen" }, { 
          status: 400,
          headers: response.headers 
        });
      }

      return redirect("/exams");
    } catch (error) {
      return json({ error: "Error al eliminar el examen" }, { 
        status: 400,
        headers: response.headers 
      });
    }
  }

  return json({ error: "Operación no válida" }, { 
    headers: response.headers 
  });
};

export default function ExamsIndex() {
  const { profile, exams, stats } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const submit = useSubmit();
  
  // Estados separados para cada modal
  const [examToView, setExamToView] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Calcular totales importantes
  const totalEnviados = stats.sentToLab + stats.inAnalysis + stats.resultsAvailable + stats.completed + stats.rejected;
  const totalResultados = stats.resultsAvailable + stats.completed + stats.rejected;
  const porcentajeResultados = totalEnviados > 0 
    ? Math.round((totalResultados / totalEnviados) * 100) 
    : 0;

  const handleExamDelete = (examId: string) => {
    setExamToDelete(examId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (examToDelete) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("examId", examToDelete);
      submit(formData, { method: "post" });
      setShowDeleteModal(false);
      setExamToDelete(null);
    }
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setExamToDelete(null);
  };

  const handleStatusChange = async (examId: string, newStatus: Exam["status"]) => {
    try {
      await fetch(`/api/exams/${examId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      revalidator.revalidate();
    } catch (error) {
      console.error("Error updating exam status:", error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen p-6 bg-gray-900">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight">
                Gestión de Exámenes
              </h1>
              <span className="text-sm text-muted-foreground">
                {profile.node.display_name} - {profile.node.category}
              </span>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Main Content - Table */}
            <div className="flex-1">
              <ExamTable
                exams={exams}
                onDelete={handleExamDelete}
                onStatusChange={handleStatusChange}
                onExamClick={(examId) => setExamToView(examId)}
              />
            </div>

            {/* Right Sidebar - All Stats */}
            <div className="w-[400px]">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  icon={BeakerIcon}
                  title="Total Exámenes"
                  value={stats.total}
                  description="Total registrados"
                  colorClass="bg-blue-600"
                  className="h-24"
                />
                <InfoCard
                  icon={ClipboardDocumentCheckIcon}
                  title="Enviados al Lab"
                  value={totalEnviados}
                  description={`${totalEnviados} procesados`}
                  colorClass="bg-blue-500"
                  className="h-24"
                />
                <InfoCard
                  icon={ClipboardDocumentCheckIcon}
                  title="Resultados Recibidos"
                  value={totalResultados}
                  description={`${porcentajeResultados}% enviados`}
                  colorClass="bg-green-500"
                  className="h-24"
                />
                <InfoCard
                  icon={UserGroupIcon}
                  title="Completados"
                  value={stats.completed}
                  description="Finalizados"
                  colorClass="bg-green-600"
                  className="h-24"
                />
                <InfoCard
                  icon={ClockIcon}
                  title="Creados"
                  value={stats.registered}
                  description="Pendientes"
                  colorClass="bg-gray-600"
                  className="h-24"
                />
                <InfoCard
                  icon={ClipboardDocumentCheckIcon}
                  title="Recolectados"
                  value={stats.collected}
                  description="Por enviar"
                  colorClass="bg-yellow-500"
                  className="h-24"
                />
                <InfoCard
                  icon={ClipboardDocumentCheckIcon}
                  title="En Tránsito"
                  value={stats.sentToLab}
                  description="Al laboratorio"
                  colorClass="bg-blue-400"
                  className="h-24"
                />
                <InfoCard
                  icon={ClipboardDocumentCheckIcon}
                  title="En Análisis"
                  value={stats.inAnalysis}
                  description="En proceso"
                  colorClass="bg-purple-500"
                  className="h-24"
                />
                <InfoCard
                  icon={ClipboardDocumentCheckIcon}
                  title="Resultados por Registrar"
                  value={stats.resultsAvailable}
                  description="Por registrar"
                  colorClass="bg-green-400"
                  className="h-24"
                />
                <InfoCard
                  icon={ClipboardDocumentCheckIcon}
                  title="Rechazados"
                  value={stats.rejected}
                  description="No procesables"
                  colorClass="bg-red-500"
                  className="h-24"
                />
              </div>
            </div>
          </div>

          {/* Modals */}
          {examToView && (
            <ExamDetailsModal
              examId={examToView}
              onClose={() => setExamToView(null)}
            />
          )}
          {showDeleteModal && (
            <ConfirmationModal
              title="Eliminar Examen"
              message="¿Estás seguro que deseas eliminar este examen? Esta acción no se puede deshacer."
              confirmText="Eliminar"
              cancelText="Cancelar"
              onConfirm={confirmDelete}
              onCancel={closeModal}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Boundary de error
export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Error al cargar los exámenes
          </h1>
          <p className="text-gray-300 mb-4">
            {error instanceof Error
              ? error.message
              : "Ha ocurrido un error inesperado"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
