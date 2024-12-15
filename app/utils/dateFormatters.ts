// app/utils/dateFormatters.ts

/**
 * Formatea una fecha según las opciones proporcionadas.
 * Si ocurre un error, retorna "Fecha inválida".
 *
 * @param dateString - La cadena de fecha a formatear.
 * @param options - Opciones de formato de Intl.DateTimeFormat.
 * @returns La fecha formateada como cadena.
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  }
): string => {
  try {
    // Verifica que dateString sea una fecha válida
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return new Intl.DateTimeFormat('es-CL', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha larga con hora.
 *
 * @param dateString - La cadena de fecha a formatear.
 * @returns La fecha formateada en un estilo largo.
 */
export const formatLongDate = (dateString: string): string => {
  return formatDate(dateString, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
};
