import { useFormContext } from "react-hook-form";
import { useState } from "react";

export const TreatmentsSection = () => {
  const { register } = useFormContext();
  const [treatments, setTreatments] = useState([{ id: 0 }]);

  const addTreatment = () => {
    setTreatments([...treatments, { id: treatments.length }]);
  };

  const removeTreatment = (index: number) => {
    setTreatments(treatments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-300">
          Tratamientos efectuados
        </label>
        <button
          type="button"
          onClick={addTreatment}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar tratamiento
        </button>
      </div>
      
      {treatments.map((treatment, index) => (
        <div key={treatment.id} className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-5">
            <input
              type="text"
              {...register(`clinicalInfo.treatments.${index}.name`)}
              placeholder="Tratamiento"
              className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="col-span-5">
            <input
              type="text"
              {...register(`clinicalInfo.treatments.${index}.year`)}
              placeholder="Año"
              className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="col-span-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeTreatment(index)}
                className="inline-flex items-center px-2 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
