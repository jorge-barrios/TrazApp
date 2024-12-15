// app/components/common/form/FormSelect.tsx
import { forwardRef, type SelectHTMLAttributes } from 'react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options?: Array<{ value: string, label: string }>;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ error, options, children, className, ...props }, ref) => (
    <select
      ref={ref}
      {...props}
      className={`bg-gray-700 text-white rounded px-3 py-2 
        ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${error ? 'border-2 border-red-500' : ''}
        ${className || ''}`}
    >
      {options ? 
        options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )) 
        : children}
    </select>
  )
);

FormSelect.displayName = 'FormSelect';