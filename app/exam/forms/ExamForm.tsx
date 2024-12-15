// /app/components/exam/forms/ExamForm.tsx
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { toTitleCase } from "~/utils/formatters";

export function ExamSection() {
  const {
    register,
    formState: { errors, touchedFields },
    watch,
    setValue,
    trigger
  } = useFormContext();

  const selectedOrgan = watch('organ');

  // Efecto para actualizar el tipo de muestra cuando cambia el órgano
  useEffect(() => {
    if (selectedOrgan === 'vagina') {
      setValue('sampleType', 'vaginal');
    } else {
      // Si cambia de vagina a cervix, resetear a un valor válido para cervix
      if (watch('sampleType') === 'vaginal') {
        setValue('sampleType', 'endocervical');
      }
    }
  }, [selectedOrgan, setValue]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = toTitleCase(e.target.value);
    setValue(fieldName, value, {
      shouldValidate: true
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Actualizar cada campo para ser requerido */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Fecha del Examen*
          </label>
          <input
            type="date"
            {...register('examDate', { required: "Campo requerido" })}
            className={`bg-gray-700 text-white rounded px-3 py-2 ${
              touchedFields.examDate && errors.examDate 
                ? 'border-2 border-red-500' 
                : ''
            }`}
          />
          {errors.examDate && (
            <span className="text-red-500 text-xs">{errors.examDate.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Prioridad*
          </label>
          <select
            {...register('examPriority', { required: "Campo requerido" })}
            className={`bg-gray-700 text-white rounded px-3 py-2 ${
              touchedFields.examPriority && errors.examPriority 
                ? 'border-2 border-red-500' 
                : ''
            }`}
          >
            <option value="">Seleccionar</option>
            <option value="normal">Normal</option>
            <option value="urgente">Urgente</option>
          </select>
          {errors.examPriority && (
            <span className="text-red-500 text-xs">{errors.examPriority.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Propósito*
          </label>
          <select
            {...register('purpose', { 
              required: "Campo requerido",
              validate: (value) => value !== "" || "Debe seleccionar una opción"
            })}
            className={`bg-gray-700 text-white rounded px-3 py-2 ${
              touchedFields.purpose && errors.purpose 
                ? 'border-2 border-red-500' 
                : ''
            }`}
          >
            <option value="">Seleccionar</option>
            <option value="screening">Tamizaje</option>
            <option value="followup">Seguimiento</option>
          </select>
          {errors.purpose && (
            <span className="text-red-500 text-xs">{errors.purpose.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Tipo de Examen*
          </label>
          <select
            {...register('examType', { 
              required: "Campo requerido",
              validate: (value) => value !== "" || "Debe seleccionar una opción"
            })}
            className={`bg-gray-700 text-white rounded px-3 py-2 ${
              touchedFields.examType && errors.examType 
                ? 'border-2 border-red-500' 
                : ''
            }`}
          >
            <option value="">Seleccionar</option>
            <option value="ecografia">Ecografía</option>
            <option value="mamografia">Mamografía</option>           
            <option value="PAP">PAP</option>
            <option value="mri">Resonancia Magnética</option>
            <option value="ct">Tomografía Computarizada</option>
          </select>
          {errors.examType && (
            <span className="text-red-500 text-xs">{errors.examType.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Órgano*
          </label>
          <select
            {...register('organ', { 
              required: "Campo requerido",
              validate: (value) => value !== "" || "Debe seleccionar una opción"
            })}
            className={`bg-gray-700 text-white rounded px-3 py-2 ${
              touchedFields.organ && errors.organ 
                ? 'border-2 border-red-500' 
                : ''
            }`}
          >
            <option value="">Seleccionar</option>
            <option value="cervix">Cérvix</option>
            <option value="vagina">Vagina</option>
          </select>
          {errors.organ && (
            <span className="text-red-500 text-xs">{errors.organ.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Tipo de Muestra*
          </label>
          <select
            {...register('sampleType', { 
              required: "Campo requerido",
              validate: (value) => value !== "" || "Debe seleccionar una opción"
            })}
            className={`bg-gray-700 text-white rounded px-3 py-2 ${
              touchedFields.sampleType && errors.sampleType 
                ? 'border-2 border-red-500' 
                : ''
            }`}
            disabled={selectedOrgan === 'vagina'} // Deshabilitar si es vagina
          >
            {selectedOrgan === 'vagina' ? (
              <option value="vaginal">Vaginal</option>
            ) : (
              <>
                <option value="">Seleccionar</option>
                <option value="endocervical">Endocervical</option>
                <option value="exocervical">Exocervical</option>
                <option value="both">Ambas</option>
              </>
            )}
          </select>
          {errors.sampleType && (
            <span className="text-red-500 text-xs">{errors.sampleType.message}</span>
          )}
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <label className="text-sm font-medium text-gray-400">
            Observaciones (Opcional)
          </label>
           <input
              type="text"
            {...register('examObservations')}
            onChange={(e) => handleTextChange(e, 'examObservations')}
            className="w-full bg-gray-700 text-white rounded px-3 py-1.5"
            rows={1}
            placeholder="Ingrese observaciones relevantes del examen..."
          />
        </div>
      </div>
    </div>
  );
}