// ... (existing types)

export const REJECTION_REASONS = [
  'CONTAMINATED_SAMPLE', // Muestra contaminada
  'INSUFFICIENT_SAMPLE', // Muestra insuficiente
  'INCORRECT_CONTAINER', // Contenedor incorrecto
  'DAMAGED_CONTAINER', // Contenedor dañado
  'IMPROPER_STORAGE', // Almacenamiento inadecuado
  'EXPIRED_SAMPLE', // Muestra vencida
  'LABELING_ERROR', // Error en etiquetado
  'OTHER' // Otro motivo
] as const;

export type RejectionReason = typeof REJECTION_REASONS[number];

export interface RejectionData {
  reason: RejectionReason;
  additionalNotes?: string;
}
