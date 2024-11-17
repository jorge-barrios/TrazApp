export const formatRut = (rut: string) => {
  // Eliminar puntos y guión
  let value = rut.replace(/\./g, '').replace(/-/g, '');
  // Eliminar cualquier caracter que no sea número o k
  value = value.replace(/[^0-9kK]/g, '');
  
  if (value.length > 1) {
    const dv = value.slice(-1);
    const rutNumbers = value.slice(0, -1);
    value = rutNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
  }
  
  return value;
};

export const validateRut = (rut: string): boolean => {
  if (typeof rut !== 'string') return false;

  // Limpiar el RUT de puntos y guión
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();

  // Verificar largo mínimo y que no tenga caracteres inválidos
  if (cleanRut.length < 7 || cleanRut.length > 9) return false;
  if (!/^[0-9]+[0-9K]$/.test(cleanRut)) return false;

  // Separar cuerpo y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  // Sumar cada dígito multiplicado por el factor correspondiente
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  // Calcular dígito verificador esperado
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();

  // Comparar dígito verificador calculado con el proporcionado
  return calculatedDV === dv;
};

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const toTitleCase = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
