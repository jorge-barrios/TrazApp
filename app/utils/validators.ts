import { validateRut } from "./formatters";

export const validateRequired = (value: any) => {
  if (!value) return "Este campo es requerido";
  if (typeof value === "string" && !value.trim()) return "Este campo es requerido";
  return true;
};

export const validateRUN = (value: string) => {
  if (!value) return "El RUN es requerido";
  if (!validateRut(value)) return "El RUN no es válido";
  return true;
};

export const validateSelect = (value: string) => {
  if (!value || value === "") return "Debe seleccionar una opción";
  return true;
};

export const validatePhone = (value: string) => {
  if (!value) return "El teléfono es requerido";
  const phoneRegex = /^\+?56\s?9\s?\d{8}$/;
  if (!phoneRegex.test(value.replace(/\s/g, ''))) {
    return "Formato inválido: +56 9 XXXX XXXX";
  }
  return true;
};
