export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      inhabitants: {
        Row: {
          added_at: string
          id: string
          name: string
          species: string
          tank_id: string
          type: string
        }
        Insert: {
          added_at?: string
          id?: string
          name: string
          species: string
          tank_id: string
          type: string
        }
        Update: {
          added_at?: string
          id?: string
          name?: string
          species?: string
          tank_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inhabitants_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_events: {
        Row: {
          id: string
          notes: string | null
          performed_at: string
          tank_id: string
          type: string
        }
        Insert: {
          id?: string
          notes?: string | null
          performed_at?: string
          tank_id: string
          type: string
        }
        Update: {
          id?: string
          notes?: string | null
          performed_at?: string
          tank_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_events_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
        ]
      }
      parameter_logs: {
        Row: {
          ammonia: number | null
          id: string
          logged_at: string
          nitrate: number | null
          nitrite: number | null
          ph: number | null
          tank_id: string
          temperature: number | null
        }
        Insert: {
          ammonia?: number | null
          id?: string
          logged_at?: string
          nitrate?: number | null
          nitrite?: number | null
          ph?: number | null
          tank_id: string
          temperature?: number | null
        }
        Update: {
          ammonia?: number | null
          id?: string
          logged_at?: string
          nitrate?: number | null
          nitrite?: number | null
          ph?: number | null
          tank_id?: string
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parameter_logs_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
        ]
      }
      tanks: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          user_id: string
          volume_liters: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          user_id: string
          volume_liters: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          user_id?: string
          volume_liters?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never
