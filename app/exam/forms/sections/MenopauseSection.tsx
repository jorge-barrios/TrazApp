import { useFormContext } from "react-hook-form";

export const MenopauseSection = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Antecedentes de Menopausia
        </label>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.menopause.status")}
              value="YES"
              id="menopause-yes"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="menopause-yes" className="ml-2 text-sm text-gray-300">
              Sí
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.menopause.status")}
              value="NO"
              id="menopause-no"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="menopause-no" className="ml-2 text-sm text-gray-300">
              No
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.menopause.status")}
              value="UNKNOWN"
              id="menopause-unknown"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="menopause-unknown" className="ml-2 text-sm text-gray-300">
              No sabe
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          FUR o menopausia
        </label>
        <input
          type="date"
          {...register("clinicalInfo.menopause.lastPeriodDate")}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
  );
};
