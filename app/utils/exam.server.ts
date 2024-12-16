import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';

interface CreateExamStatusHistoryParams {
  examId: string;
  status: string;
  createdBy: string;
  notes?: string;
}

export async function createExamStatusHistory(
  supabase: SupabaseClient<Database>,
  {
    examId,
    status,
    createdBy,
    notes
  }: CreateExamStatusHistoryParams
) {
  const { data, error } = await supabase
    .from('exam_status_history')
    .insert([
      {
        exam_id: examId,
        status,
        created_by: createdBy,
        notes,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserRecentActions(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit: number = 10
) {
  const { data, error } = await supabase
    .from('exam_status_history')
    .select(`
      status,
      created_at,
      notes,
      exam:exam_id (
        id,
        exam_type,
        patient_name
      ),
      created_by_user:created_by (
        full_name
      )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getExamCurrentStatus(
  supabase: SupabaseClient<Database>,
  examId: string
) {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      id,
      exam_type,
      patient_name,
      priority,
      status
    `)
    .eq('id', examId)
    .single();

  if (error) throw error;
  return data;
}

export async function undoLastExamStatusChange(
  supabase: SupabaseClient<Database>,
  examId: string
) {
  // Obtener los últimos dos cambios de estado para este examen
  const { data: statusHistory, error: historyError } = await supabase
    .from('exam_status_history')
    .select('*')
    .eq('exam_id', examId)
    .order('created_at', { ascending: false })
    .limit(2);

  if (historyError) throw historyError;
  if (!statusHistory || statusHistory.length < 2) {
    throw new Error('No hay un estado anterior al cual revertir');
  }

  // El estado anterior es el segundo en la lista (índice 1)
  const previousStatus = statusHistory[1].status;

  // Crear un nuevo registro con el estado anterior
  const { error: updateError } = await supabase
    .from('exam_status_history')
    .insert({
      exam_id: examId,
      status: previousStatus,
      created_by: statusHistory[0].created_by,
      notes: 'Estado revertido al anterior'
    });

  if (updateError) throw updateError;

  return { previousStatus };
}
