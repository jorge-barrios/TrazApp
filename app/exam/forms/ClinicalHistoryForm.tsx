import { useFormContext } from "react-hook-form";
import { examConfigs, type ExamType } from "../config/examConfig";
import { CervixSection } from "./sections/CervixSection";
import { MenopauseSection } from "./sections/MenopauseSection";
import { PregnancySection } from "./sections/PregnancySection";
import { ContraceptiveSection } from "./sections/ContraceptiveSection";
import { HPVSection } from "./sections/HPVSection";
import { TreatmentsSection } from "./sections/TreatmentsSection";

export const ClinicalHistoryForm = () => {
  const { watch } = useFormContext();
  const examType = watch("examType") as ExamType;

  const currentConfig = examConfigs[examType];

  if (!currentConfig) {
    return (
      <div className="text-gray-400 p-4 text-center">
        Seleccione un tipo de examen para ver los campos específicos
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentConfig.sections.includes('cervix') && <CervixSection />}
      {currentConfig.sections.includes('menopause') && <MenopauseSection />}
      {currentConfig.sections.includes('pregnancy') && <PregnancySection />}
      {currentConfig.sections.includes('contraceptive') && <ContraceptiveSection />}
      {currentConfig.sections.includes('hpv') && <HPVSection />}
      {currentConfig.sections.includes('treatments') && <TreatmentsSection />}
    </div>
  );
};