// Archivo: /app/utils/validations.ts

export interface ValidationError {
    field: string;
    message: string;
  }
  
  export function validateEmail(email: string): ValidationError | null {
    if (!email) {
      return {
        field: 'email',
        message: 'El correo electrónico es requerido'
      };
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        field: 'email',
        message: 'Ingrese un correo electrónico válido'
      };
    }
  
    return null;
  }
  
  export function validatePassword(password: string): ValidationError | null {
    if (!password) {
      return {
        field: 'password',
        message: 'La contraseña es requerida'
      };
    }
  
    return null;
  }
  
  export function validateNode(selectedNode: string | null, customNode: string): ValidationError | null {
    if (!selectedNode && !customNode) {
      return {
        field: 'node',
        message: 'Debe seleccionar o especificar un punto de acceso'
      };
    }
  
    return null;
  }
  
  export function validateLoginForm(data: {
    email: string;
    password: string;
    selectedNode: string | null;
    customNode: string;
  }): ValidationError[] {
    const errors: ValidationError[] = [];
  
    const emailError = validateEmail(data.email);
    if (emailError) errors.push(emailError);
  
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.push(passwordError);
  
    const nodeError = validateNode(data.selectedNode, data.customNode);
    if (nodeError) errors.push(nodeError);
  
    return errors;
  }