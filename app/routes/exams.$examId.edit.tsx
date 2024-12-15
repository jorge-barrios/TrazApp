// app/routes/exams.$examId.edit.tsx

import { json, redirect } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form as RemixForm, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import MainLayout from "~/components/layouts/MainLayout";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { PatientSection } from "~/exam/forms/PatientForm";
import { ExamSection } from "~/exam/forms/ExamForm";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { validateRut } from "~/utils/formatters";
import type { Exam } from "~/types/exam";

interface LoaderData {
  exam: Exam;
  profile: {
    id: string;
    full_name: string;
    role: string;
    node_id: string;
    node: {
      id: string;
      display_name: string;
      category: string;
    }
  };
}

interface ActionData {
  success?: boolean;
  error?: string;
  examId?: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { session, supabase, response } = await requireAuth(request);
  const { examId } = params;

  console.log("ExamId recibido:", examId);

  if (!examId) {
    throw new Error("ID de examen no proporcionado");
  }

  try {
    // Obtener el perfil del usuario con la información del nodo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        node:nodes (
          id,
          display_name,
          category
        )
      `)
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error("Error al cargar el perfil:", profileError);
      throw profileError;
    }

    console.log("Perfil cargado:", profile);

    // Obtener el examen con los datos del paciente
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select(`
        *,
        node:nodes (
          id,
          display_name,
          category
        ),
        patient:patients!exams_patient_id_fkey (
          id,
          nationality,
          document_type,
          document_number,
          first_name,
          first_last_name,
          second_last_name,
          full_name,
          gender,
          birth_date,
          region,
          commune,
          address,
          phone,
          health_insurance,
          other_health_insurance
        )
      `)
      .eq('id', examId)
      .single();

    if (examError) {
      console.error("Error loading exam:", examError);
      throw new Error("Error al cargar el examen");
    }

    console.log("Examen cargado:", exam);

    if (!exam) {
      throw new Error("Examen no encontrado");
    }

    // Verificar permisos
    if (profile.role !== 'admin' && exam.node_id !== profile.node_id) {
      throw new Error("No tienes permisos para editar este examen");
    }

    if (exam.status !== 'registered') {
      throw new Error(`No se puede editar este examen porque está en estado '${exam.status}'. Solo se pueden editar exámenes en estado 'Registrado'`);
    }

    return json({ exam, profile }, { headers: response.headers });
  } catch (error) {
    console.error('Error en el loader:', error);
    throw error;
  }
};

// Schema de validación con Zod (igual que en exams.new.tsx)
const examSchema = z.object({
  nationality: z.string().min(1, "La nacionalidad es requerida"),
  documentType: z.string().min(1, "El tipo de documento es requerido"),
  documentNumber: z.string().min(1, "El número de documento es requerido"),
  firstName: z.string().min(1, "El nombre es requerido"),
  firstLastName: z.string().min(1, "El primer apellido es requerido"),
  secondLastName: z.string().min(1, "El segundo apellido es requerido"),
  gender: z.string().min(1, "El sexo es requerido"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  region: z.string().min(1, "La región es requerida"),
  commune: z.string().min(1, "La comuna es requerida"),
  address: z.string().min(1, "La dirección es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  healthInsurance: z.string().min(1, "La previsión es requerida"),
  otherHealthInsurance: z.string().optional(),
  examType: z.string().min(1, "El tipo de examen es requerido"),
  examPriority: z.string().min(1, "La prioridad es requerida"),
  examObservations: z.string().optional()
});

export const action: ActionFunction = async ({ request, params }) => {
  const { session, supabase, response } = await requireAuth(request);
  const formData = await request.formData();
  const { examId } = params;

  if (!examId) {
    throw new Error("ID de examen no proporcionado");
  }

  try {
    // Verificar permisos primero
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    // Obtener el examen actual
    const { data: exam, error: examFetchError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (examFetchError) {
      console.error("Error loading exam:", examFetchError);
      throw new Error("Error al cargar el examen");
    }

    if (!exam) {
      throw new Error("Examen no encontrado");
    }

    if (profile.role !== 'admin' && exam.node_id !== profile.node_id) {
      throw new Error("No tienes permisos para editar este examen");
    }

    if (exam.status !== 'registered') {
      throw new Error(`No se puede editar este examen porque está en estado '${exam.status}'. Solo se pueden editar exámenes en estado 'Registrado'`);
    }

    // 1. Actualizar datos del paciente
    const patientData = {
      document_type: formData.get('documentType'),
      document_number: formData.get('documentNumber'),
      first_name: formData.get('firstName'),
      first_last_name: formData.get('firstLastName'),
      second_last_name: formData.get('secondLastName'),
      gender: formData.get('gender'),
      birth_date: formData.get('birthDate'),
      nationality: formData.get('nationality'),
      region: formData.get('region'),
      commune: formData.get('commune'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      health_insurance: formData.get('healthInsurance'),
      other_health_insurance: formData.get('otherHealthInsurance'),
      updated_at: new Date().toISOString()
    };

    const { error: patientError } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', exam.patient_id);

    if (patientError) {
      console.error("Error updating patient:", patientError);
      throw patientError;
    }

    // 2. Actualizar datos del examen
    const examData = {
      exam_type: formData.get('examType'),
      priority: formData.get('examPriority'),
      observations: formData.get('examObservations'),
      updated_at: new Date().toISOString()
    };

    const { error: examError } = await supabase
      .from('exams')
      .update(examData)
      .eq('id', examId);

    if (examError) {
      console.error("Error updating exam:", examError);
      throw examError;
    }

    return json<ActionData>({
      success: true,
      examId: examId
    }, {
      headers: response.headers
    });
  } catch (error) {
    console.error('Error al actualizar el examen:', error);
    return json<ActionData>({
      success: false,
      error: error.message
    }, {
      status: 400,
      headers: response.headers
    });
  }
};

// Componentes de estructura (igual que en exams.new.tsx)
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
    {children}
  </h2>
);

const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <SectionTitle>{title}</SectionTitle>
    {children}
  </div>
);

// Componente para mostrar el mensaje de éxito
const ExamSuccess = ({ examId, onClose }: { examId: string, onClose: () => void }) => (
  <div className="text-center py-8">
    <div className="mb-4 flex justify-center">
      <div className="rounded-full bg-green-100 p-3">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <h3 className="text-lg font-medium text-white mb-2">Examen Actualizado con Éxito</h3>
    <p className="text-gray-400 mb-4">ID del examen: {examId}</p>
    <div className="space-x-4">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Cerrar
      </button>
    </div>
  </div>
);

// Componente principal
export default function EditExam() {
  const { exam, profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("Datos recibidos en el componente:", { exam, profile });

  const methods = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: {
      nationality: exam.patient?.nationality || '',
      documentType: exam.patient?.document_type || '',
      documentNumber: exam.patient?.document_number || '',
      firstName: exam.patient?.first_name || '',
      firstLastName: exam.patient?.first_last_name || '',
      secondLastName: exam.patient?.second_last_name || '',
      gender: exam.patient?.gender || '',
      birthDate: exam.patient?.birth_date || '',
      region: exam.patient?.region || '',
      commune: exam.patient?.commune || '',
      address: exam.patient?.address || '',
      phone: exam.patient?.phone || '',
      healthInsurance: exam.patient?.health_insurance || '',
      otherHealthInsurance: exam.patient?.other_health_insurance || '',
      examType: exam.exam_type || '',
      examPriority: exam.priority || 'normal',
      examObservations: exam.observations || ''
    }
  });

  useEffect(() => {
    if (exam) {
      console.log("useEffect ejecutándose con exam:", exam);
      methods.reset({
        nationality: exam.patient?.nationality || '',
        documentType: exam.patient?.document_type || '',
        documentNumber: exam.patient?.document_number || '',
        firstName: exam.patient?.first_name || '',
        firstLastName: exam.patient?.first_last_name || '',
        secondLastName: exam.patient?.second_last_name || '',
        gender: exam.patient?.gender || '',
        birthDate: exam.patient?.birth_date || '',
        region: exam.patient?.region || '',
        commune: exam.patient?.commune || '',
        address: exam.patient?.address || '',
        phone: exam.patient?.phone || '',
        healthInsurance: exam.patient?.health_insurance || '',
        otherHealthInsurance: exam.patient?.other_health_insurance || '',
        examType: exam.exam_type || '',
        examPriority: exam.priority || 'normal',
        examObservations: exam.observations || ''
      });
    }
  }, [exam]);

  const onSubmit = async (data: z.infer<typeof examSchema>) => {
    try {
      console.log("Form data to submit:", data); // Para debug
      const formData = new FormData();
      
      // Agregar todos los campos al FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      submit(formData, { method: "post" });
    } catch (error) {
      console.error('Error al enviar:', error);
    }
  };

  if (actionData?.success) {
    return (
      <MainLayout>
        <div className="min-h-screen p-6 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <ExamSuccess 
              examId={actionData.examId!} 
              onClose={() => window.history.back()}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen p-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">
            Editar Examen
          </h1>
          
          <FormProvider {...methods}>
            <RemixForm 
              method="post" 
              className="bg-gray-800/40 rounded-lg p-6 space-y-6"
              onSubmit={methods.handleSubmit(onSubmit)}
              noValidate
            >
              {/* Sección Profesional */}
              <FormSection title="Datos del Profesional">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-400">Nombre</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      disabled
                      className="bg-gray-700 text-white rounded px-3 py-2 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-400">Centro</label>
                    <input
                      type="text"
                      value={profile.node?.display_name || 'No disponible'}
                      disabled
                      className="bg-gray-700 text-white rounded px-3 py-2 disabled:opacity-50"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Sección Paciente */}
              <FormSection title="Datos del Paciente">
                <PatientSection isEdit={true} />
              </FormSection>

              {/* Sección Examen */}
              <FormSection title="Datos del Examen">
                <ExamSection />
              </FormSection>

              {/* Errores del formulario */}
              {Object.keys(methods.formState.errors).length > 0 && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <p className="text-red-500 font-medium">
                    Por favor corrija los siguientes errores:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    {Object.entries(methods.formState.errors).map(([key, error]: [string, any]) => (
                      <li key={key} className="text-red-400 text-sm">
                        {`${key}: ${error.message || 'Campo requerido'}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Error de la acción */}
              {actionData?.error && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <p className="text-red-500">{actionData.error}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded transition-colors ${
                    isSubmitting
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span>Guardando...</span>
                    </span>
                  ) : (
                    "Actualizar Examen"
                  )}
                </button>
              </div>
            </RemixForm>
          </FormProvider>
        </div>
      </div>
    </MainLayout>
  );
}
