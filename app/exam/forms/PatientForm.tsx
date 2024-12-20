// app/components/exam/forms/PatientForm.tsx
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { formatRut, calculateAge, toTitleCase } from "~/utils/formatters";
import { DocumentScanner } from "../../components/DocumentScanner";
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useFetcher } from "@remix-run/react";

export function PatientSection({ isEdit = false }) {
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
  const [showFullForm, setShowFullForm] = useState(isEdit); // Show form immediately if editing
  const fetcher = useFetcher();

  const clearForm = () => {
    if (isEdit) return; // Don't clear form if editing
    
    // Limpiar todos los campos excepto documentType y documentNumber
    setValue('nationality', '', { shouldValidate: false });
    setValue('firstName', '', { shouldValidate: false });
    setValue('firstLastName', '', { shouldValidate: false });
    setValue('secondLastName', '', { shouldValidate: false });
    setValue('gender', '', { shouldValidate: false });
    setValue('birthDate', '', { shouldValidate: false });
    setValue('phone', '', { shouldValidate: false });
    setValue('region', '', { shouldValidate: false });
    setValue('commune', '', { shouldValidate: false });
    setValue('address', '', { shouldValidate: false });
    setValue('healthInsurance', '', { shouldValidate: false });
    setValue('otherHealthInsurance', '', { shouldValidate: false });
    setShowFullForm(false);
  };

  const searchPatient = async (documentNumber: string) => {
    if (isEdit) return; // Don't search if editing
    if (!documentNumber || documentType !== 'RUT') return;
    
    setVerificationStatus('verifying');
    clearForm();
    
    try {
      const response = await fetch(`/api/patient/search?documentNumber=${documentNumber}`);
      const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 500));

      if (response.ok && data.patient) {
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
        setShowFullForm(true);
      } else {
        setVerificationStatus('not_found');
        setShowFullForm(true);
      }
    } catch (error) {
      console.error('Error buscando paciente:', error);
      setVerificationStatus('not_found');
      setShowFullForm(true);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEdit) return; // Don't handle changes if editing
    
    const value = e.target.value;
    if (documentType === 'RUT') {
      const formattedRut = formatRut(value);
      setValue('documentNumber', formattedRut, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      setVerificationStatus('idle');
    } else {
      setValue('documentNumber', value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const documentNumber = getValues('documentNumber');
      if (documentNumber && documentNumber.length >= 9) {
        searchPatient(documentNumber);
      }
    }
  };

  const handleSearch = () => {
    const documentNumber = getValues('documentNumber');
    if (documentNumber && documentNumber.length >= 9) {
      searchPatient(documentNumber);
    }
  };

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
    trigger('documentNumber');
    clearForm();
  }, [documentType, trigger]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = toTitleCase(e.target.value);
    setValue(fieldName, value, {
      shouldValidate: true
    });
  };

  return (
    <div className="space-y-4">
      {!isEdit && <DocumentScanner />}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Sección de búsqueda */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-400">
            Tipo de ID*
          </label>
          <select
            {...register('documentType')}
            className="bg-gray-700 text-white rounded px-3 py-2"
            disabled={isEdit}
          >
            <option value="RUT">RUN</option>
            <option value="PASSPORT">Pasaporte</option>
          </select>
          {errors.documentType && (
            <span className="text-red-500 text-xs">{errors.documentType.message}</span>
          )}
        </div>

        <div className="flex flex-col space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-400">
            {documentType === 'RUT' ? 'RUT*' : 'Número de Documento*'}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                {...register('documentNumber')}
                onChange={handleDocumentChange}
                onKeyDown={handleKeyPress}
                disabled={isEdit}
                className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${
                  touchedFields.documentNumber && errors.documentNumber
                    ? 'border-2 border-red-500'
                    : verificationStatus === 'found'
                    ? 'border-2 border-green-500'
                    : ''
                }`}
              />
              {/* Status indicator */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {verificationStatus === 'verifying' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                )}
                {verificationStatus === 'found' && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
                {verificationStatus === 'not_found' && documentType === 'RUT' && (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            {!isEdit && documentType === 'RUT' && (
              <button
                type="button"
                onClick={handleSearch}
                disabled={verificationStatus === 'verifying'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                Buscar
              </button>
            )}
          </div>
          {errors.documentNumber && (
            <span className="text-red-500 text-xs">{errors.documentNumber.message}</span>
          )}
          {verificationStatus === 'not_found' && documentType === 'RUT' && (
            <span className="text-yellow-500 text-xs">
              Paciente no encontrado. Complete el formulario con sus datos.
            </span>
          )}
        </div>

        {/* Resto del formulario */}
        {showFullForm && (
          <>
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
                Sexo*
              </label>
              <select
                {...register('gender', { required: true })}
                className="bg-gray-700 text-white rounded px-3 py-2"
              >
                <option value="">Seleccionar</option>
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
                <option value="other">Otro</option>
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
                className={`bg-gray-700 text-white rounded px-3 py-2 ${
                  touchedFields.secondLastName && errors.secondLastName ? 'border-2 border-red-500' : ''
                }`}
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
                <option value="">Seleccionar</option>
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
                className={`bg-gray-700 text-white rounded px-3 py-2 ${
                  touchedFields.commune && errors.commune ? 'border-2 border-red-500' : ''
                }`}
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
                className={`w-full bg-gray-700 text-white rounded px-3 py-1.5 ${
                  touchedFields.address && errors.address ? 'border-2 border-red-500' : ''
                }`}
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
          </>
        )}
      </div>
    </div>
  );
}