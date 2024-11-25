// /app/routes/exams/new.tsx
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form as RemixForm, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { PatientSection } from "~/components/exam/forms/PatientForm";
import { ExamSection } from "~/components/exam/forms/ExamForm";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { validateRut } from "~/utils/formatters";
import { validateRequired, validateRUN, validateSelect, validatePhone } from "~/utils/validators";

// Loader con datos del profesional
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { session, response, supabase } = await requireAuth(request);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        node:nodes (
          display_name,
          category
        )
      `)
      .eq('user_id', session.user.id)
      .single();

    if (error) throw error;

    return json({ 
      user: session.user,
      profile 
    }, {
      headers: response.headers
    });
  } catch (error) {
    return redirect("/login");
  }
};

// Componente de éxito
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

// Función para generar ID del examen
const generateExamId = (patientId: string, date: string) => {
  const timestamp = new Date().getTime();
  return `EX-${patientId.slice(-4)}-${timestamp.toString(36)}`.toUpperCase();
};

export const action: ActionFunction = async ({ request }) => {
  const { session, supabase } = await requireAuth(request);
  const formData = await request.formData();
  
  const examId = generateExamId(
    formData.get("patientRut") as string,
    new Date().toISOString()
  );

  const timestamp = new Date().toISOString();

  const newExam = {
    id: examId,
    patient_name: formData.get("patientName"),
    patient_rut: formData.get("patientRut"),
    patient_age: formData.get("patientAge"),
    patient_gender: formData.get("patientGender"),
    exam_type: formData.get("examType"),
    priority: formData.get("examPriority"),
    observations: formData.get("examObservations"),
    status: "registered",
    created_by: session.user.id,
    created_at: timestamp,
    updated_at: timestamp
  };

  const { error } = await supabase
    .from("exams")
    .insert(newExam);

  if (error) throw error;

  return json({ success: true, examId });
};

// Componentes de sección
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

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-400">{label}</label>
    {children}
  </div>
);

const examSchema = z.object({
  nationality: z.string().min(1, "La nacionalidad es requerida"),
  documentType: z.string().min(1, "El tipo de documento es requerido"),
  patientRut: z.string().superRefine((val, ctx) => {
    const result = validateRUN(val);
    if (result !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result
      });
    }
  }),
  firstName: z.string().min(1, "El nombre es requerido"),
  firstLastName: z.string().min(1, "El primer apellido es requerido"),
  secondLastName: z.string().min(1, "El segundo apellido es requerido"),
  gender: z.string().min(1, "El sexo es requerido"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  age: z.number().nullable(), // Cambiar a number y permitir null
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
  examObservations: z.string().optional(), // Solo este campo es opcional
});

export default function NewExam() {
  const { user, profile } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const methods = useForm({
    mode: 'onTouched', // Cambiar a onTouched
    criteriaMode: 'all',
    defaultValues: {
      // Datos del paciente
      nationality: 'Chilena',
      documentType: 'run',
      patientRut: '',
      firstName: '',
      firstLastName: '',
      secondLastName: '',
      gender: 'female',
      birthDate: '',
      age: '',  // Agregar campo edad
      region: 'RM',
      commune: 'La Florida',
      address: '',
      phone: '+569 ',
      healthInsurance: 'fonasa',
      otherHealthInsurance: '', // Agregar campo para otra previsión

      // Datos del examen
      examDate: new Date().toISOString().split('T')[0],
      purpose: '',
      examType: 'pap',
      examPriority: 'normal',
      organ: '',
      sampleType: '',
      examObservations: ''
    },
    resolver: zodResolver(examSchema)
  });

  // Agregar este efecto para debug
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      console.log('Field changed:', name, value, type);
      console.log('Current errors:', methods.formState.errors);
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);

  const onSubmit = async (data: z.infer<typeof examSchema>) => {
    console.log('Form is valid, submitting:', data);
    try {
      // Construir el objeto de paciente
      const patientName = `${data.firstName} ${data.firstLastName} ${data.secondLastName}`;
      
      const formData = new FormData();
      formData.append('patientName', patientName);
      formData.append('patientRut', data.patientRut);
      formData.append('patientAge', data.age.toString());
      formData.append('patientGender', data.gender);
      formData.append('examType', data.examType);
      formData.append('examPriority', data.examPriority);
      formData.append('examObservations', data.examObservations || '');

      // Enviar el formulario
      submit(formData, { method: "post" });
    } catch (error) {
      console.error('Error al enviar:', error);
    }
  };

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
  };

  if (actionData?.success) {
    return (
        <div className="min-h-screen p-6 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <ExamSuccess 
              examId={actionData.examId} 
              onClose={() => window.history.back()}
            />
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen p-6 bg-gray-900">
        <div className="max-w-7xl mx-auto"> {/* Cambiado de max-w-4xl a max-w-7xl */}
          <h1 className="text-3xl font-bold text-white mb-6">
            Nuevo Examen
          </h1>
          
          <FormProvider {...methods}>
            <RemixForm 
              method="post" 
              className="bg-gray-800/40 rounded-lg p-6 space-y-6"
              onSubmit={methods.handleSubmit(onSubmit, onError)}
              noValidate // Agregar esto para permitir validación personalizada
            >
              {/* Sección Profesional */}
              <FormSection title="Datos del Profesional">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Nombre">
                    <input
                      type="text"
                      value={profile.full_name}
                      disabled
                      className="bg-gray-700 text-white rounded px-3 py-2 disabled:opacity-50"
                    />
                  </FormField>
                  <FormField label="Centro">
                    <input
                      type="text"
                      value={profile.node.display_name}
                      disabled
                      className="bg-gray-700 text-white rounded px-3 py-2 disabled:opacity-50"
                    />
                  </FormField>
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

              {/* Mostrar siempre el contenedor de errores */}
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <p className="text-red-500 font-medium">
                  Los campos marcados con * son obligatorios
                </p>
                {Object.keys(methods.formState.errors).length > 0 && (
                  <ul className="list-disc list-inside mt-2">
                    {Object.entries(methods.formState.errors).map(([key, error]: [string, any]) => (
                      <li key={key} className="text-red-400 text-sm">
                        {`${key}: ${error.message || 'Campo requerido'}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded transition-colors ${
                    Object.keys(methods.formState.errors).length > 0
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
                      <span>Creando...</span>
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
  );
}
