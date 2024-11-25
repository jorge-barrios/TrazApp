// app/types/exam.ts
export type ExamStatus = 'registered' | 'pending' | 'in_process' | 'completed';

export interface Exam {
  id: string;
  node_id: string;
  patient_name: string;
  patient_rut: string;
  patient_age?: number;
  patient_gender?: string;
  exam_type: string;
  status: ExamStatus;
  priority?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  node?: {
    display_name: string;
  };
}

export interface ExamFormData {
  // Datos del paciente
  nationality: string;
  documentType: string;
  patientRut: string;
  firstName: string;
  firstLastName: string;
  secondLastName: string;
  gender: string;
  birthDate: string;
  age: number | null;
  region: string;
  commune: string;
  address: string;
  phone: string;
  healthInsurance: string;
  otherHealthInsurance?: string;

  // Datos del examen
  examDate: string;
  purpose: string;
  examType: string;
  examPriority: string;
  organ: string;
  sampleType: string;
  examObservations?: string;
}