// app/components/exam/forms/ExamDataForm.tsx
import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { FormField, FormInput, FormSelect } from '~/components/common/form';

export function ExamDataForm() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  
  const examType = watch('examType');
  const organ = watch('organ');

  // Efecto para manejar dependencias entre campos
  useEffect(() => {
    // Si el órgano cambia, actualizar opciones de tipo de muestra
    if (organ === 'vagina') {
      setValue('sampleType', 'vaginal', { shouldValidate: true });
    } else if (organ === 'cervix' && ['vaginal'].includes(watch('sampleType'))) {
      setValue('sampleType', 'endocervical', { shouldValidate: true });
    }
  }, [organ, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Información básica del examen */}
      <FormField label="Fecha del Examen" required error={errors.examDate?.message}>
        <FormInput 
          type="date" 
          {...register('examDate')}
          min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
        />
      </FormField>

      <FormField label="Tipo de Examen" required error={errors.examType?.message}>
        <FormSelect
          {...register('examType')}
        >
          <option value="">Seleccionar</option>
          <option value="pap">PAP</option>
          <option value="biopsia">Biopsia</option>
          <option value="cultivo">Cultivo</option>
          <option value="otro">Otro</option>
        </FormSelect>
      </FormField>

      <FormField label="Prioridad" required error={errors.examPriority?.message}>
        <FormSelect
          {...register('examPriority')}
        >
          <option value="normal">Normal</option>
          <option value="urgent">Urgente</option>
        </FormSelect>
      </FormField>

      {/* Datos específicos según tipo de examen */}
      <FormField label="Propósito" required error={errors.purpose?.message}>
        <FormSelect
          {...register('purpose')}
        >
          <option value="">Seleccionar</option>
          <option value="screening">Tamizaje</option>
          <option value="followup">Seguimiento</option>
          <option value="diagnostic">Diagnóstico</option>
        </FormSelect>
      </FormField>

      <FormField label="Órgano" required error={errors.organ?.message}>
        <FormSelect
          {...register('organ')}
        >
          <option value="">Seleccionar</option>
          <option value="cervix">Cérvix</option>
          <option value="vagina">Vagina</option>
          <option value="endometrio">Endometrio</option>
        </FormSelect>
      </FormField>

      <FormField label="Tipo de Muestra" required error={errors.sampleType?.message}>
        <FormSelect
          {...register('sampleType')}
          disabled={organ === 'vagina'} // Deshabilitar si es vaginal
        >
          <option value="">Seleccionar</option>
          {organ === 'vagina' ? (
            <option value="vaginal">Vaginal</option>
          ) : (
            <>
              <option value="endocervical">Endocervical</option>
              <option value="exocervical">Exocervical</option>
              <option value="both">Ambas</option>
            </>
          )}
        </FormSelect>
      </FormField>

      {/* Campos adicionales según el tipo de examen */}
      {examType === 'pap' && (
        <div className="col-span-full">
          <FormField label="Última menstruación" error={errors.lastPeriod?.message}>
            <FormInput 
              type="date" 
              {...register('lastPeriod')}
            />
          </FormField>
        </div>
      )}

      {/* Observaciones */}
      <div className="col-span-full">
        <FormField label="Observaciones" error={errors.examObservations?.message}>
          <textarea
            {...register('examObservations')}
            className="w-full h-24 bg-gray-700 text-white rounded px-3 py-2 
              resize-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese observaciones relevantes del examen..."
          />
        </FormField>
      </div>

      {/* Alertas y validaciones específicas */}
      {examType === 'pap' && watch('examPriority') === 'urgent' && (
        <div className="col-span-full p-4 bg-yellow-900/20 border border-yellow-500 rounded">
          <p className="text-yellow-400 text-sm">
            ⚠️ Los PAP marcados como urgentes requieren justificación en las observaciones
          </p>
        </div>
      )}
    </div>
  );
}