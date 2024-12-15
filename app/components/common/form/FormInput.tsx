// app/components/common/form/FormInput.tsx
import { forwardRef, type InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={`bg-gray-700 text-white rounded px-3 py-2 
        ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${error ? 'border-2 border-red-500' : ''}
        ${className || ''}`}
    />
  )
);

FormInput.displayName = 'FormInput';