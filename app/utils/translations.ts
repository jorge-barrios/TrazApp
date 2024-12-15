export const translateSampleType = (type: string): string => {
  const translations: Record<string, string> = {
    'ENDOCERVICAL': 'Endocervical',
    'EXOCERVICAL': 'Exocervical',
    'BOTH': 'Endo/Exocervical',
    'VAGINAL': 'Vaginal'
  };
  return translations[type] || type;
};

export const translateClinicalStatus = (status: string): string => {
  const translations: Record<string, string> = {
    'YES': 'Sí',
    'NO': 'No',
    'UNKNOWN': 'No especificado'
  };
  return translations[status] || status;
};

export const translateContraceptiveMethod = (method: string): string => {
  const translations: Record<string, string> = {
    'NONE': 'Ninguno',
    'IUD': 'DIU',
    'HORMONAL': 'Hormonal',
    'BARRIER': 'Barrera',
    'OTHER': 'Otro'
  };
  return translations[method] || method;
};

export const translateCervixAppearance = (appearance: string): string => {
  const translations: Record<string, string> = {
    'HEALTHY': 'Sano',
    'BENIGN_CERVICOPATHY': 'Cervicopatía benigna',
    'NEOPLASIA_SUSPICION': 'Sospecha de neoplasia'
  };
  return translations[appearance] || appearance;
};

export const translatePurpose = (purpose: string): string => {
  const translations: Record<string, string> = {
    'SCREENING': 'Tamizaje',
    'FOLLOW_UP': 'Seguimiento'
  };
  return translations[purpose] || purpose;
};

// Función para formatear RUT
export const formatRut = (rut: string | null | undefined): string => {
  if (!rut) return 'No especificado';
  
  // Eliminar puntos y guión si existen
  const cleanRut = rut.replace(/\./g, '').replace('-', '');
  const dv = cleanRut.slice(-1);
  const rutBody = cleanRut.slice(0, -1);
  
  // Agregar puntos
  const formatted = rutBody
    .split('')
    .reverse()
    .join('')
    .match(/.{1,3}/g)
    ?.join('.')
    .split('')
    .reverse()
    .join('');
    
  return `${formatted}-${dv}`;
};

// Función para formatear teléfono
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return 'No especificado';
  
  // Eliminar espacios y caracteres especiales
  const cleanPhone = phone.replace(/\s+/g, '');
  
  // Si empieza con +56, formatear número chileno
  if (cleanPhone.startsWith('+56')) {
    const number = cleanPhone.slice(3);
    return `+56 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5)}`;
  }
  
  return phone;
};

// Función para formatear dirección
export const formatAddress = (address: string | null | undefined, comuna: string | null | undefined, region: string | null | undefined): string => {
  if (!address && !comuna && !region) return 'No especificada';
  
  const parts = [];
  if (address) parts.push(address);
  if (comuna) parts.push(comuna);
  if (region) parts.push(region);
  
  return parts.join(', ');
};

export const translateOrgan = (organ: string | null | undefined): string => {
  if (!organ) return 'No especificado';
  
  const translations: Record<string, string> = {
    'cervix': 'Cérvix',
    'vagina': 'Vagina',
    'CERVIX': 'Cérvix',
    'VAGINA': 'Vagina'
  };

  return translations[organ] || organ;
};
