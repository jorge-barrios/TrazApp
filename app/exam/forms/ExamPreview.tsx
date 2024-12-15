// app/components/exam/forms/ExamPreview.tsx
export function ExamPreview() {
    const { getValues } = useFormContext();
    const values = getValues();
  
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white">Confirmar datos del examen</h3>
        
        {/* Resumen de datos del paciente */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-2">Datos del Paciente</h4>
          <dl className="grid grid-cols-2 gap-2">
            <PreviewField label="Nombre" value={`${values.firstName} ${values.firstLastName} ${values.secondLastName}`} />
            <PreviewField label="RUT" value={values.patientRut} />
            {/* ... otros campos */}
          </dl>
        </div>
  
        {/* Resumen de datos del examen */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-2">Datos del Examen</h4>
          <dl className="grid grid-cols-2 gap-2">
            <PreviewField label="Tipo" value={values.examType} />
            <PreviewField label="Prioridad" value={values.examPriority} />
            {/* ... otros campos */}
          </dl>
        </div>
      </div>
    );
  }
  
  // Componente auxiliar para mostrar campos
  function PreviewField({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <dt className="text-sm text-gray-400">{label}</dt>
        <dd className="text-white">{value}</dd>
      </div>
    );
  }