// Archivo: /app/hooks/useLoginForm.ts
import { useState } from 'react';

interface FormErrors {
  email?: string;
  password?: string;
  category?: string;
  centerId?: string;
  form?: string;
}

interface FormState {
  email: string;
  password: string;
  selectedCategory: string | null;
  centerId: string;
  rememberMe: boolean;
}

const CATEGORY_PREFIXES = {
  'CESFAM': 'cesfam',
  'TRANSPORTE': 'transporte',
  'LABORATORIO': 'lab'
} as const;

export function useLoginForm(initialValues?: Partial<FormState>) {
  const [formState, setFormState] = useState<FormState>({
    email: initialValues?.email || '',
    password: initialValues?.password || '',
    selectedCategory: initialValues?.selectedCategory || null,
    centerId: initialValues?.centerId || '',
    rememberMe: initialValues?.rememberMe || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const setEmail = (email: string) => 
    setFormState(prev => ({ ...prev, email }));
  
  const setPassword = (password: string) => 
    setFormState(prev => ({ ...prev, password }));
  
  const setSelectedCategory = (category: string) => 
    setFormState(prev => ({ ...prev, selectedCategory: category }));
  
  const setCenterId = (id: string) => 
    setFormState(prev => ({ ...prev, centerId: id.toLowerCase() }));
  
  const setRememberMe = (rememberMe: boolean) => 
    setFormState(prev => ({ ...prev, rememberMe }));

  const clearError = (field: keyof FormErrors) => 
    setErrors(prev => ({ ...prev, [field]: undefined }));

  const setError = (field: keyof FormErrors, message: string) => 
    setErrors(prev => ({ ...prev, [field]: message }));

  const getNodeId = (): string | null => {
    if (!formState.selectedCategory || !formState.centerId) return null;
    const prefix = CATEGORY_PREFIXES[formState.selectedCategory as keyof typeof CATEGORY_PREFIXES];
    return `${prefix}${formState.centerId}`;
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    
    if (!formState.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (!formState.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (!formState.selectedCategory) {
      newErrors.category = 'Debe seleccionar un tipo de centro';
    }

    if (formState.selectedCategory && !formState.centerId) {
      newErrors.centerId = 'Debe ingresar un identificador para el centro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formState,
    setEmail,
    setPassword,
    setSelectedCategory,
    setCenterId,
    setRememberMe,
    errors,
    clearError,
    setError,
    validate,
    getNodeId
  };
}