// Archivo: /app/types/database.ts
export interface Database {
  public: {
    Tables: {
      nodes: {
        Row: {
          id: string;
          category: 'CESFAM' | 'Transporte' | 'Laboratorio';
          identifier: string;
          node_id: string;
          display_name: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['nodes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['nodes']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          role: 'professional' | 'transport' | 'laboratory' | 'admin'; // Agregado 'admin'
          access_level: 'admin' | 'user';
          node_id: string | null;
          active: boolean;
          last_login: string | null;
          remember_me: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
    };
  };
}