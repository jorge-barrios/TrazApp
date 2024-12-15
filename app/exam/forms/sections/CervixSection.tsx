import { useFormContext } from "react-hook-form";

export const CervixSection = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Aspecto del Cuello</h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="cervix-healthy"
              {...register("clinicalInfo.cervixAppearance")}
              value="HEALTHY"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="cervix-healthy" className="text-sm text-gray-300">
              Sano
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="cervix-benign"
              {...register("clinicalInfo.cervixAppearance")}
              value="BENIGN_CERVICOPATHY"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="cervix-benign" className="text-sm text-gray-300">
              Cervicopatía benigna
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="cervix-neoplasia"
              {...register("clinicalInfo.cervixAppearance")}
              value="NEOPLASIA_SUSPICION"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="cervix-neoplasia" className="text-sm text-gray-300">
              Sospecha Neoplasia
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="cervix-leucorrhea"
              {...register("clinicalInfo.cervixAppearance")}
              value="LEUCORRHEA"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="cervix-leucorrhea" className="text-sm text-gray-300">
              Leucorrea
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
