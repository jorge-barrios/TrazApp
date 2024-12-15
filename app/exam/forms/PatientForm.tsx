// app/components/exam/forms/PatientForm.tsx
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { formatRut, calculateAge, toTitleCase } from "~/utils/formatters";
import { DocumentScanner } from "../../components/DocumentScanner";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function PatientSection() {
  const {
    register,
    formState: { errors, touchedFields },
    watch,
    setValue,
    trigger,
    getValues
  } = useFormContext();

  const documentType = watch('documentType');
  const birthDate = watch('birthDate');
  const healthInsurance = watch('healthInsurance');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'found' | 'not_found'>('idle');

  // Modificar el efecto para calcular la edad
  useEffect(() => {
    if (birthDate) {
      const calculatedAge = calculateAge(birthDate);
      setValue('age', calculatedAge, { 
        shouldValidate: true 
      });
    }
  }, [birthDate, setValue]);

  // Actualizar validación cuando cambia el tipo de documento
  useEffect(() => {
    trigger('patientRut');
  }, [documentType, trigger]);

  const searchPatient = async () => {
    const documentNumber = getValues('patientRut');
    if (!documentNumber) return;

    setVerificationStatus('verifying');
    try {
      const response = await fetch(`/api/patient?documentNumber=${documentNumber}`);
      const data = await response.json();

      if (response.ok && data.patient) {
        // Llenar formulario con datos del paciente
        setValue('nationality', data.patient.nationality, { shouldValidate: true });
        setValue('firstName', data.patient.first_name, { shouldValidate: true });
        setValue('firstLastName', data.patient.first_last_name, { shouldValidate: true });
        setValue('secondLastName', data.patient.second_last_name, { shouldValidate: true });
        setValue('gender', data.patient.gender, { shouldValidate: true });
        setValue('birthDate', data.patient.birth_date, { shouldValidate: true });
        setValue('phone', data.patient.phone, { shouldValidate: true });
        setValue('region', data.patient.region, { shouldValidate: true });
        setValue('commune', data.patient.commune, { shouldValidate: true });
        setValue('address', data.patient.address, { shouldValidate: true });
        setValue('healthInsurance', data.patient.health_insurance, { shouldValidate: true });
        if (data.patient.other_health_insurance) {
          setValue('otherHealthInsurance', data.patient.other_health_insurance);
        }
        setVerificationStatus('found');
      } else {
        setVerificationStatus('not_found');
      }
    } catch (error) {
      console.error('Error verificando paciente:', error);
      setVerificationStatus('not_found');
    }
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (documentType === 'RUT') {
      const formattedRut = formatRut(value);
      setValue('patientRut', formattedRut, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      setVerificationStatus('idle');
    } else {
      setValue('patientRut', value);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = toTitleCase(e.target.value);
    setValue(fieldName, value, {
      shouldValidate: true
    });
  };

  return (
    <div className="space-y-4">
      <DocumentScanner />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Nacionalidad*
          </label>
          <input
            type="text"
            {...register('nationality', { 
              required: { 
                value: true, 
                message: "La nacionalidad es obligatoria" 
              }
            })}
            onChange={(e) => handleTextChange(e, 'nationality')}
            className={`bg-gray-700 text-white rounded px-3 py-1.5 ${
              touchedFields.nationality && errors.nationality ? 'border-2 border-red-500' : ''
            }`}
            placeholder="Chilena"
          />
          {errors.nationality && (
            <span className="text-red-500 text-xs">{errors.nationality.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Tipo de ID*
          </label>
          <select
            {...register('documentType', { required: "Campo requerido" })}
            className="bg-gray-700 text-white rounded px-3 py-2"
            defaultValue="RUT"
          >
            <option value="RUT">RUN</option>
            <option value="PASSPORT">Pasaporte</option>
          </select>
          {errors.documentType && (
            <span className="text-red-500 text-xs">{errors.documentType.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            {documentType === 'RUT' ? 'RUN*' : 'Pasaporte*'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              {...register('patientRut')}
              onChange={handleRutChange}
              className={`flex-1 bg-gray-700 text-white rounded px-3 py-2 ${
                touchedFields.patientRut && errors.patientRut ? 'border-2 border-red-500' : ''
              }`}
              placeholder={documentType === 'RUT' ? '12345678-9' : 'Número de pasaporte'}
            />
            <button
              type="button"
              onClick={searchPatient}
              disabled={verificationStatus === 'verifying'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {verificationStatus === 'verifying' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
          {errors.patientRut && (
            <span className="text-red-500 text-xs">{errors.patientRut.message}</span>
          )}
          {verificationStatus === 'found' && (
            <span className="text-green-500 text-xs">Paciente encontrado - datos cargados</span>
          )}
          {verificationStatus === 'not_found' && (
            <span className="text-yellow-500 text-xs">Paciente no encontrado - ingrese los datos</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Sexo*
          </label>
          <select
            {...register('gender', { required: true })}
            className="bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
            <option value="">Otro</option>
          </select>
          {errors.gender && (
            <span className="text-red-500 text-sm">Campo requerido</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Nombres*
          </label>
          <input
            type="text"
            {...register('firstName', { required: true })}
            onChange={(e) => handleTextChange(e, 'firstName')}
            className="bg-gray-700 text-white rounded px-3 py-2"
            placeholder="Nombre1, Nombre 2"
          />
          {errors.firstName && (
            <span className="text-red-500 text-sm">Campo requerido</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Primer Apellido*
          </label>
          <input
            type="text"
            {...register('firstLastName', { required: true })}
            onChange={(e) => handleTextChange(e, 'firstLastName')}
            className="bg-gray-700 text-white rounded px-3 py-2"
            placeholder="Apellido1"
          />
          {errors.firstLastName && (
            <span className="text-red-500 text-sm">Campo requerido</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Segundo Apellido*
          </label>
          <input
            type="text"
            {...register('secondLastName', { required: "Campo requerido" })}
            onChange={(e) => handleTextChange(e, 'secondLastName')}
            className="bg-gray-700 text-white rounded px-3 py-2"
            placeholder="Apellido2"
          />
          {errors.secondLastName && (
            <span className="text-red-500 text-xs">{errors.secondLastName.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Fecha de Nacimiento*
          </label>
          <input
            type="date"
            {...register('birthDate', { required: true })}
            className="bg-gray-700 text-white rounded px-3 py-2"
          />
          {errors.birthDate && (
            <span className="text-red-500 text-sm">Campo requerido</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Edad (calculada)
          </label>
          <input
            type="text"
            {...register('age')}
            className="bg-gray-700 text-white/60 rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
            readOnly
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Teléfono*
          </label>
          <input
            type="tel"
            {...register('phone', { required: "Campo requerido" })}
            className="bg-gray-700 text-white rounded px-3 py-2"
            placeholder="+56 (9) xxxx xxxx"
          />
          {errors.phone && (
            <span className="text-red-500 text-xs">{errors.phone.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Región de Residencia*
          </label>
          <select
            {...register('region', { required: true })}
            className="bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="XV">XV. Arica y Parinacota</option>
            <option value="I">I. Tarapacá</option>
            <option value="II">II. Antofagasta</option>
            <option value="III">III. Atacama</option>
            <option value="IV">IV. Coquimbo</option>
            <option value="V">V. Valparaíso</option>
            <option value="VI">VI. O'Higgins</option>
            <option value="RM">XIII. Región Metropolitana</option>
            <option value="VII">VII. Maule</option>
            <option value="VIII">VIII. Biobío</option>
            <option value="IX">IX. Araucanía</option>
            <option value="XIV">XIV. Los Ríos</option>
            <option value="X">X. Los Lagos</option>
            <option value="XI">XI. Aysén</option>
            <option value="XII">XII. Magallanes</option>
          </select>
          {errors.region && (
            <span className="text-red-500 text-sm">Campo requerido</span>
          )}          
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Comuna de Residencia*
          </label>
          <input
            type="text"
            {...register('commune', { required: "Campo requerido" })}
            onChange={(e) => handleTextChange(e, 'commune')}
            className="bg-gray-700 text-white rounded px-3 py-2"
            placeholder="La Florida"
          />
          {errors.commune && (
            <span className="text-red-500 text-xs">{errors.commune.message}</span>
          )}
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <label className="text-sm font-medium text-gray-400">
            Dirección*
          </label>
          <input
            type="text"
            {...register('address', { required: "Campo requerido" })}
            onChange={(e) => handleTextChange(e, 'address')}
            className="w-full bg-gray-700 text-white rounded px-3 py-1.5"
            placeholder="Avenida Uno #10021"
          />
          {errors.address && (
            <span className="text-red-500 text-xs">{errors.address.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Previsión de Salud*
          </label>
          <select
            {...register('healthInsurance', { 
              required: "Campo requerido",
              validate: (value) => value !== "" || "Debe seleccionar una opción"
            })}
            className="bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="">Seleccionar</option>
            <option value="fonasa">Fonasa</option>
            <option value="isapre">Isapre</option>
            <option value="other">Otra</option>
            <option value="none">Sin Previsión</option>
          </select>
          {errors.healthInsurance && (
            <span className="text-red-500 text-xs">{errors.healthInsurance.message}</span>
          )}
        </div>

        {healthInsurance === 'other' && (
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-400">
              Especifique Previsión*
            </label>
            <input
              type="text"
              {...register('otherHealthInsurance', { 
                required: healthInsurance === 'other'
              })}
              onChange={(e) => handleTextChange(e, 'otherHealthInsurance')}
              className={`bg-gray-700 text-white rounded px-3 py-2 ${
                touchedFields.otherHealthInsurance && errors.otherHealthInsurance ? 'border-2 border-red-500' : ''
              }`}
              placeholder="Ingrese nombre de la previsión"
            />
            {errors.otherHealthInsurance && (
              <span className="text-red-500 text-xs">Campo requerido</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}