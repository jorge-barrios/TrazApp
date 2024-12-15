// app/components/exam/forms/ExamWizard.tsx
import { useState } from 'react';
import { useExamForm } from '~/hooks/useExamForm';

type Step = 'patient-search' | 'patient-info' | 'exam-info' | 'preview';

export function ExamWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('patient-search');
  const [isLoading, setIsLoading] = useState(false);
  const [savedDraft, setSavedDraft] = useState<boolean>(false);

  const methods = useExamForm();
  const { handleSubmit, formState: { isValid, dirtyFields } } = methods;

  // Renderizar paso actual
  const renderStep = () => {
    switch(currentStep) {
      case 'patient-search':
        return <PatientSearch onExistingPatient={handleExistingPatient} onNewPatient={() => setCurrentStep('patient-info')} />;
      case 'patient-info':
        return <PatientInfo onNext={() => setCurrentStep('exam-info')} onBack={() => setCurrentStep('patient-search')} />;
      case 'exam-info':
        return <ExamInfo onNext={() => setCurrentStep('preview')} onBack={() => setCurrentStep('patient-info')} />;
      case 'preview':
        return <ExamPreview onSubmit={handleSubmit(onSubmit)} onBack={() => setCurrentStep('exam-info')} />;
    }
  };

  // Guardar borrador automáticamente
  useEffect(() => {
    const saveDraft = async () => {
      if (Object.keys(dirtyFields).length > 0) {
        const formData = methods.getValues();
        await saveDraftToLocalStorage(formData);
        setSavedDraft(true);
      }
    };

    const debouncedSave = debounce(saveDraft, 1000);
    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [dirtyFields, methods]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <StepProgress currentStep={currentStep} />
      
      {/* Formulario */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStep()}
        </form>
      </FormProvider>

      {/* Estado de guardado */}
      {savedDraft && (
        <div className="fixed bottom-4 right-4">
          <Toast message="Borrador guardado" type="success" />
        </div>
      )}
    </div>
  );
}