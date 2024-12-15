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
  patient_name: string;
  patient_rut: string;
  patient_age?: number;
  patient_gender?: string;
  exam_type: string;
  status: ExamStatus;
  priority?: ExamPriority;
  observations?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  node?: {
    display_name: string;
    category: string;
  };
}

// Interfaz para eventos en la línea de tiempo
export interface TimelineEvent {
  id: string;
  exam_id: string;
  status: ExamStatus;
  created_at: string;
  created_by: string;
  notes?: string; // Campo opcional para notas relacionadas al cambio de estado
  created_by_profile?: {
    full_name: string;
    role?: string; // Nuevo campo opcional para el rol del creador
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
