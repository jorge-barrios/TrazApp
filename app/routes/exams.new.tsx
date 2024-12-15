// /app/routes/exams.new.tsx

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

// Tipos para los datos cargados desde el loader y acción
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

// Loader para obtener datos del usuario y su perfil
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { session, response, supabase } = await requireAuth(request);
    
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

    if (profileError) throw profileError;

    return json<LoaderData>({ 
      user: session.user,
      profile 
    }, {
      headers: response.headers
    });
  } catch (error) {
    return redirect("/login");
  }
};

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
    <h3 className="text-lg font-medium text-white mb-2">Examen Registrado con Éxito</h3>
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

// Action para procesar el formulario
export const action: ActionFunction = async ({ request }) => {
  const { session, supabase, response } = await requireAuth(request);
  const formData = await request.formData();

  try {
    // Obtener el node_id del perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('node_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) throw profileError;

    // 1. Primero crear o actualizar el paciente
    const patientData = {
      document_type: formData.get("documentType") as string,
      document_number: formData.get("patientRut") as string,
      first_name: formData.get("firstName") as string,
      first_last_name: formData.get("firstLastName") as string,
      second_last_name: formData.get("secondLastName") as string,
      birth_date: formData.get("birthDate") as string,
      gender: formData.get("gender") as string,
      nationality: formData.get("nationality") as string,
      region: formData.get("region") as string,
      commune: formData.get("commune") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      health_insurance: formData.get("healthInsurance") as string,
      other_health_insurance: formData.get("otherHealthInsurance") as string || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Verificar si el paciente ya existe
    const { data: existingPatients, error: searchError } = await supabase
      .from('patients')
      .select('id')
      .eq('document_number', patientData.document_number);

    if (searchError) {
      throw searchError;
    }

    let patientId;

    if (existingPatients && existingPatients.length > 0) {
      // Actualizar paciente existente
      const existingPatient = existingPatients[0];
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          ...patientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPatient.id);

      if (updateError) throw updateError;
      patientId = existingPatient.id;
    } else {
      // Crear nuevo paciente
      const { data: newPatient, error: insertError } = await supabase
        .from('patients')
        .insert(patientData)
        .select('id')
        .single();

      if (insertError) throw insertError;
      patientId = newPatient.id;
    }

    // 2. Crear el examen vinculado al paciente
    const examData = {
      node_id: profile.node_id,
      patient_id: patientId,
      patient_name: `${patientData.first_name} ${patientData.first_last_name} ${patientData.second_last_name}`,
      exam_type: formData.get("examType") as string,
      status: 'registered',
      priority: formData.get("examPriority") as string || null,
      observations: formData.get("examObservations") as string || null,
      exam_details: {
        purpose: formData.get("purpose"),
        organ: formData.get("organ"),
        sample_type: formData.get("sampleType")
      },
      created_by: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert(examData)
      .select()
      .single();

    if (examError) throw examError;

    return json<ActionData>({ 
      success: true,
      examId: exam.id
    }, {
      headers: response.headers
    });

  } catch (error) {
    console.error('Error al crear el examen:', error);
    return json<ActionData>({
      success: false,
      error: error.message
    }, {
      status: 400,
      headers: response.headers
    });
  }
};

// Componentes para la estructura del formulario
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

// Schema de validación con Zod
const examSchema = z.object({
  nationality: z.string().min(1, "La nacionalidad es requerida"),
  documentType: z.string().min(1, "El tipo de documento es requerido"),
  patientRut: z.string().min(1, "El RUN es requerido"),
  firstName: z.string().min(1, "El nombre es requerido"),
  firstLastName: z.string().min(1, "El primer apellido es requerido"),
  secondLastName: z.string().min(1, "El segundo apellido es requerido"),
  gender: z.string().min(1, "El sexo es requerido"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  age: z.number().nullable(),
  region: z.string().min(1, "La región es requerida"),
  commune: z.string().min(1, "La comuna es requerida"),
  address: z.string().min(1, "La dirección es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  healthInsurance: z.string().min(1, "La previsión es requerida"),
  otherHealthInsurance: z.string().optional(),

  // Datos del examen
  examDate: z.string().min(1, "La fecha del examen es requerida"),
  purpose: z.string().min(1, "El propósito es requerido"),
  examType: z.string().min(1, "El tipo de examen es requerido"),
  examPriority: z.string().min(1, "La prioridad es requerida"),
  organ: z.string().min(1, "El órgano es requerido"),
  sampleType: z.string().min(1, "El tipo de muestra es requerido"),
  examObservations: z.string().optional()
});

// Componente principal
export default function NewExam() {
  const { user, profile } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const methods = useForm({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: {
      // Datos del paciente
      nationality: 'Chilena',
      documentType: 'RUT',
      patientRut: '',
      firstName: '',
      firstLastName: '',
      secondLastName: '',
      gender: 'female',
      birthDate: '',
      age: null,
      region: 'RM',
      commune: 'La Florida',
      address: '',
      phone: '+569',
      healthInsurance: 'fonasa',
      otherHealthInsurance: '',

      // Datos del examen
      examDate: new Date().toISOString().split('T')[0],
      purpose: '',
      examType: 'PAP',
      examPriority: 'normal',
      organ: '',
      sampleType: '',
      examObservations: ''
    },
    resolver: zodResolver(examSchema)
  });

  const onSubmit = async (data: z.infer<typeof examSchema>) => {
    try {
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
            Nuevo Examen
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
                      value={profile.node.display_name}
                      disabled
                      className="bg-gray-700 text-white rounded px-3 py-2 disabled:opacity-50"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Sección Paciente */}
              <FormSection title="Datos del Paciente">
                <PatientSection />
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
                    "Crear Examen"
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