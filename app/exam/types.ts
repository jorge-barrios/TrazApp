// app/types/exam.ts

// Estados posibles del examen
export type ExamStatus =
  | 'registered'        // Registrado
  | 'collected'         // Recolectado
  | 'sent_to_lab'       // Enviado al laboratorio
  | 'in_analysis'       // En análisis
  | 'results_available' // Resultado disponible
  | 'completed'         // Completado
  | 'rejected';         // Rechazado

// Prioridades del examen
export type ExamPriority = 'normal' | 'urgent';

// Interfaz principal del examen
export interface Exam {
  id: string;
  node_id: string;
  patient_id: string | null;
  patient_name: string | null;
  exam_type: string;
  exam_details: {
    [key: string]: any;
  } | null;
  status: ExamStatus;
  priority?: ExamPriority;
  observations?: string;
  result_url?: string;
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

// Interfaz para eventos en la línea de tiempo
export interface TimelineEvent {
  id: string;
  exam_id: string;
  status: ExamStatus;
  created_at: string;
  created_by: string;
  notes?: string;
  created_by_profile?: {
    full_name: string;
    role?: string;
  };
}

// Interfaz para estadísticas de estados
export interface ExamStatusStats {
  registered: number;
  collected: number;
  sent_to_lab: number;
  in_analysis: number;
  results_available: number;
  completed: number;
  rejected: number;
}