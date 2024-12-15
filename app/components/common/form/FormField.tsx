// app/components/common/form/FormField.tsx
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-400">
        {label}{required && '*'}
      </label>
      {children}
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}