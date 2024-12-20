import { Exam } from "~/types";

export const statusLabels: Record<Exam["status"], string> = {
  registered: "Registrado",
  collected: "Recolectado",
  sent_to_lab: "Enviado a Laboratorio",
  in_analysis: "En Análisis",
  results_available: "Resultados Disponibles",
  completed: "Completado",
  rejected: "Rechazado",
} as const;

export const priorityLabels: Record<NonNullable<Exam["priority"]>, string> = {
  normal: "Normal",
  urgent: "Urgente",
} as const;

export const priorityColors: Record<string, string> = {
  normal: "gray",
  urgent: "red",
} as const;
