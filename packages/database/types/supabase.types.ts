export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      characters: {
        Row: {
          class_lv: number | null
          class_type: Database["public"]["Enums"]["class_type_enum"] | null
          default_auto_recovery_cooltime: number | null
          defense: number | null
          exp_per_lv: number | null
          exp_per_lv_increase_rate: number | null
          id: number
          max_hp: number | null
          max_lv: number | null
          max_skills_auto_recovery_cooltime: number | null
          max_skills_defense: number | null
          max_skills_hp: number | null
          max_skills_strength: number | null
          size_h: number | null
          size_w: number | null
          skill_point_per_level: number | null
          skills_effects_auto_recovery_cooltime: number | null
          skills_effects_defense: number | null
          skills_effects_hp: number | null
          skills_effects_strength: number | null
          strength: number | null
          summon_capacity: number | null
          view_size_h: number | null
          view_size_w: number | null
        }
        Insert: {
          class_lv?: number | null
          class_type?: Database["public"]["Enums"]["class_type_enum"] | null
          default_auto_recovery_cooltime?: number | null
          defense?: number | null
          exp_per_lv?: number | null
          exp_per_lv_increase_rate?: number | null
          id?: never
          max_hp?: number | null
          max_lv?: number | null
          max_skills_auto_recovery_cooltime?: number | null
          max_skills_defense?: number | null
          max_skills_hp?: number | null
          max_skills_strength?: number | null
          size_h?: number | null
          size_w?: number | null
          skill_point_per_level?: number | null
          skills_effects_auto_recovery_cooltime?: number | null
          skills_effects_defense?: number | null
          skills_effects_hp?: number | null
          skills_effects_strength?: number | null
          strength?: number | null
          summon_capacity?: number | null
          view_size_h?: number | null
          view_size_w?: number | null
        }
        Update: {
          class_lv?: number | null
          class_type?: Database["public"]["Enums"]["class_type_enum"] | null
          default_auto_recovery_cooltime?: number | null
          defense?: number | null
          exp_per_lv?: number | null
          exp_per_lv_increase_rate?: number | null
          id?: never
          max_hp?: number | null
          max_lv?: number | null
          max_skills_auto_recovery_cooltime?: number | null
          max_skills_defense?: number | null
          max_skills_hp?: number | null
          max_skills_strength?: number | null
          size_h?: number | null
          size_w?: number | null
          skill_point_per_level?: number | null
          skills_effects_auto_recovery_cooltime?: number | null
          skills_effects_defense?: number | null
          skills_effects_hp?: number | null
          skills_effects_strength?: number | null
          strength?: number | null
          summon_capacity?: number | null
          view_size_h?: number | null
          view_size_w?: number | null
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
      class_type_enum: "warrior" | "mage" | "archer" | "rogue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
