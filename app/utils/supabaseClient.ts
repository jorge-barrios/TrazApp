// Archivo: app/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Carga las variables de entorno del servidor
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

// Verifica que las variables de entorno estén presentes
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas correctamente.');
}

// Crea y exporta una instancia del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
