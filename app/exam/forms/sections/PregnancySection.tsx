import { useFormContext } from "react-hook-form";

export const PregnancySection = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Gestación actual
        </label>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.currentPregnancy")}
              value="YES"
              id="pregnancy-yes"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="pregnancy-yes" className="ml-2 text-sm text-gray-300">
              Sí
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.currentPregnancy")}
              value="NO"
              id="pregnancy-no"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="pregnancy-no" className="ml-2 text-sm text-gray-300">
              No
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.currentPregnancy")}
              value="UNKNOWN"
              id="pregnancy-unknown"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="pregnancy-unknown" className="ml-2 text-sm text-gray-300">
              No sabe
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
