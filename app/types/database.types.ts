export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          role: string
          access_level: string
          node_id: string
          active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        // ... resto de la definición
      }
      nodes: {
        Row: {
          id: string
          display_name: string
          category: string
          active: boolean
          // ... otros campos
        }
        // ... resto de la definición
      }
    }
  }
}
