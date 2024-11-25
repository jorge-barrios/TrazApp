// app/types/exam.ts
export type ExamStatus = 'registered' | 'pending' | 'in_process' | 'completed';
export type ExamPriority = 'normal' | 'urgent';

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
  };
}