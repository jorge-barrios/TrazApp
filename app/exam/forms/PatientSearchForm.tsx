// app/exam/forms/PatientSearchForm.tsx
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FormField, FormInput, FormSelect } from '~/components/common/form';

interface SearchStatus {
 state: 'idle' | 'searching' | 'found' | 'not-found';
 message?: string;
}

const DOCUMENT_TYPES = [
 { value: 'RUT', label: 'RUN' },
 { value: 'PASSPORT', label: 'Pasaporte' }
];

export function PatientSearchForm() {
 const [searchStatus, setSearchStatus] = useState<SearchStatus>({ state: 'idle' });
 const { 
   register, 
   formState: { errors },
   watch,
   trigger
 } = useFormContext();

 const documentType = watch('documentType');
 const patientRut = watch('patientRut');

 const handleSearch = async () => {
   // Primero validar los campos requeridos
   const isValid = await trigger(['documentType', 'patientRut']);
   if (!isValid) return;

   setSearchStatus({ state: 'searching' });
   
   // Simulación temporal sin API
   setTimeout(() => {
     setSearchStatus({ 
       state: 'not-found',
       message: 'Complete los datos del paciente para continuar'
     });
   }, 500);
 };

 // Validar automáticamente cuando ambos campos tienen valor
 const isFormValid = documentType && patientRut && !errors.documentType && !errors.patientRut;

 return (
   <div className="space-y-4">
     <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
       <div className="sm:col-span-2">
         <FormField 
           label="Tipo de Documento" 
           required 
           error={errors.documentType?.message as string}
         >
           <FormSelect
             {...register('documentType', { required: 'Este campo es requerido' })}
             options={DOCUMENT_TYPES}
             error={!!errors.documentType}
           />
         </FormField>
       </div>

       <div className="sm:col-span-3">
         <FormField 
           label="Número de Documento" 
           required 
           error={errors.patientRut?.message as string}
         >
           <div className="flex gap-2">
             <FormInput
               {...register('patientRut', { 
                 required: 'Este campo es requerido',
                 minLength: { value: 4, message: 'Mínimo 4 caracteres' }
               })}
               placeholder="Ingrese documento"
               error={!!errors.patientRut}
               className="flex-1"
             />
             <button
               type="button"
               onClick={handleSearch}
               disabled={!isFormValid || searchStatus.state === 'searching'}
               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
               {searchStatus.state === 'searching' ? (
                 <>
                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                   </svg>
                   <span>Buscando...</span>
                 </>
               ) : (
                 <>
                   <MagnifyingGlassIcon className="h-5 w-5" />
                   <span>Buscar</span>
                 </>
               )}
             </button>
           </div>
         </FormField>
       </div>
     </div>

     {/* Resto del código igual... */}
   </div>
 );
}