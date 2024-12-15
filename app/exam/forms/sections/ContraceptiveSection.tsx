import { useFormContext } from "react-hook-form";
import { toTitleCase } from "~/utils/formatters";

export function ContraceptiveSection() {
  const { register, watch, setValue, formState: { errors, touchedFields } } = useFormContext();

  const contraceptiveMethod = watch('clinicalInfo.contraceptiveMethod.type');
  const amenorrheaReason = watch('clinicalInfo.amenorrhea.reason');

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = toTitleCase(e.target.value);
    setValue(fieldName, value, {
      shouldValidate: true
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-400">
          Método Anticonceptivo*
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="NONE"
              {...register('clinicalInfo.contraceptiveMethod.type', { 
                required: "Debe seleccionar un método anticonceptivo" 
              })}
              className="text-blue-600"
            />
            <span>Ninguno</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="HORMONAL"
              {...register('clinicalInfo.contraceptiveMethod.type', { 
                required: "Debe seleccionar un método anticonceptivo" 
              })}
              className="text-blue-600"
            />
            <span>Hormonal</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="IUD"
              {...register('clinicalInfo.contraceptiveMethod.type', { 
                required: "Debe seleccionar un método anticonceptivo" 
              })}
              className="text-blue-600"
            />
            <span>DIU</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="BARRIER"
              {...register('clinicalInfo.contraceptiveMethod.type', { 
                required: "Debe seleccionar un método anticonceptivo" 
              })}
              className="text-blue-600"
            />
            <span>Barrera</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="OTHER"
              {...register('clinicalInfo.contraceptiveMethod.type', { 
                required: "Debe seleccionar un método anticonceptivo" 
              })}
              className="text-blue-600"
            />
            <span>Otro</span>
          </label>
        </div>
        {errors.clinicalInfo?.contraceptiveMethod?.type && (
          <span className="text-red-500 text-xs">{errors.clinicalInfo.contraceptiveMethod.type.message}</span>
        )}

        {contraceptiveMethod === 'OTHER' && (
          <div className="mt-2">
            <input
              type="text"
              {...register('clinicalInfo.contraceptiveMethod.other', {
                required: "Debe especificar el método anticonceptivo"
              })}
              onChange={(e) => handleTextChange(e, 'clinicalInfo.contraceptiveMethod.other')}
              className={`bg-gray-700 text-white rounded px-3 py-2 w-full ${
                touchedFields.clinicalInfo?.contraceptiveMethod?.other && 
                errors.clinicalInfo?.contraceptiveMethod?.other 
                  ? 'border-2 border-red-500' 
                  : ''
              }`}
              placeholder="Especifique el método anticonceptivo"
            />
            {errors.clinicalInfo?.contraceptiveMethod?.other && (
              <span className="text-red-500 text-xs">{errors.clinicalInfo.contraceptiveMethod.other.message}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-400">
          ¿Presenta amenorrea?*
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="YES"
              {...register('clinicalInfo.amenorrhea.status', { 
                required: "Debe indicar si presenta amenorrea" 
              })}
              className="text-blue-600"
            />
            <span>Sí</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="NO"
              {...register('clinicalInfo.amenorrhea.status', { 
                required: "Debe indicar si presenta amenorrea" 
              })}
              className="text-blue-600"
            />
            <span>No</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="UNKNOWN"
              {...register('clinicalInfo.amenorrhea.status', { 
                required: "Debe indicar si presenta amenorrea" 
              })}
              className="text-blue-600"
            />
            <span>No sabe</span>
          </label>
        </div>
        {errors.clinicalInfo?.amenorrhea?.status && (
          <span className="text-red-500 text-xs">{errors.clinicalInfo.amenorrhea.status.message}</span>
        )}

        {watch('clinicalInfo.amenorrhea.status') === 'YES' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Razón de amenorrea*
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="BREASTFEEDING"
                  {...register('clinicalInfo.amenorrhea.reason', { 
                    required: "Debe seleccionar la razón de amenorrea" 
                  })}
                  className="text-blue-600"
                />
                <span>Lactancia</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="METHOD"
                  {...register('clinicalInfo.amenorrhea.reason', { 
                    required: "Debe seleccionar la razón de amenorrea" 
                  })}
                  className="text-blue-600"
                />
                <span>Por método</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="OTHER"
                  {...register('clinicalInfo.amenorrhea.reason', { 
                    required: "Debe seleccionar la razón de amenorrea" 
                  })}
                  className="text-blue-600"
                />
                <span>Otro</span>
              </label>
            </div>
            {errors.clinicalInfo?.amenorrhea?.reason && (
              <span className="text-red-500 text-xs">{errors.clinicalInfo.amenorrhea.reason.message}</span>
            )}

            {amenorrheaReason === 'OTHER' && (
              <div className="mt-2">
                <input
                  type="text"
                  {...register('clinicalInfo.amenorrhea.otherReason', {
                    required: "Debe especificar la razón de amenorrea"
                  })}
                  onChange={(e) => handleTextChange(e, 'clinicalInfo.amenorrhea.otherReason')}
                  className={`bg-gray-700 text-white rounded px-3 py-2 w-full ${
                    touchedFields.clinicalInfo?.amenorrhea?.otherReason && 
                    errors.clinicalInfo?.amenorrhea?.otherReason 
                      ? 'border-2 border-red-500' 
                      : ''
                  }`}
                  placeholder="Especifique la razón"
                />
                {errors.clinicalInfo?.amenorrhea?.otherReason && (
                  <span className="text-red-500 text-xs">{errors.clinicalInfo.amenorrhea.otherReason.message}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
