import { useFormContext } from "react-hook-form";

export const HPVSection = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Vacunas VPH
        </label>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.hpvVaccine")}
              value="YES"
              id="hpv-yes"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="hpv-yes" className="ml-2 text-sm text-gray-300">
              Sí
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.hpvVaccine")}
              value="NO"
              id="hpv-no"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="hpv-no" className="ml-2 text-sm text-gray-300">
              No
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              {...register("clinicalInfo.hpvVaccine")}
              value="UNKNOWN"
              id="hpv-unknown"
              className="h-4 w-4 border-gray-300"
            />
            <label htmlFor="hpv-unknown" className="ml-2 text-sm text-gray-300">
              No sabe
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
