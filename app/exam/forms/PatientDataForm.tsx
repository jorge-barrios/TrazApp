// app/components/exam/forms/PatientDataForm.tsx
import { useFormContext } from 'react-hook-form';
import { FormField, FormInput, FormSelect } from '~/components/common/form';

export function PatientDataForm() {
  const { register, watch, formState: { errors } } = useFormContext();
  const healthInsurance = watch('healthInsurance');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Datos Personales */}
      <FormField label="Nombres" required error={errors.firstName?.message}>
        <FormInput {...register('firstName')} />
      </FormField>

      <FormField label="Apellido Paterno" required error={errors.firstLastName?.message}>
        <FormInput {...register('firstLastName')} />
      </FormField>

      <FormField label="Apellido Materno" required error={errors.secondLastName?.message}>
        <FormInput {...register('secondLastName')} />
      </FormField>

      <FormField label="Fecha Nacimiento" required error={errors.birthDate?.message}>
        <FormInput type="date" {...register('birthDate')} />
      </FormField>

      <FormField label="Sexo" required error={errors.gender?.message}>
        <FormSelect
          {...register('gender')}
          options={[
            { value: 'male', label: 'Hombre' },
            { value: 'female', label: 'Mujer' },
            { value: 'other', label: 'Otro' }
          ]}
        />
      </FormField>

      {/* Contacto */}
      <FormField label="Teléfono" required error={errors.phone?.message}>
        <FormInput {...register('phone')} placeholder="+56 9" />
      </FormField>

      {/* Dirección */}
      <FormField label="Región" required error={errors.region?.message}>
        <FormSelect {...register('region')} options={REGIONES_CHILE} />
      </FormField>

      <FormField label="Comuna" required error={errors.commune?.message}>
        <FormInput {...register('commune')} />
      </FormField>

      <div className="col-span-full">
        <FormField label="Dirección" required error={errors.address?.message}>
          <FormInput {...register('address')} />
        </FormField>
      </div>

      {/* Previsión */}
      <FormField label="Previsión de Salud" required error={errors.healthInsurance?.message}>
        <FormSelect
          {...register('healthInsurance')}
          options={[
            { value: 'fonasa', label: 'Fonasa' },
            { value: 'isapre', label: 'Isapre' },
            { value: 'other', label: 'Otra' }
          ]}
        />
      </FormField>

      {healthInsurance === 'other' && (
        <FormField label="Especifique Previsión" required error={errors.otherHealthInsurance?.message}>
          <FormInput {...register('otherHealthInsurance')} />
        </FormField>
      )}
    </div>
  );
}