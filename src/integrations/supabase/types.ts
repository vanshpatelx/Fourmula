export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          created_at: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      adherence_goals: {
        Row: {
          active: boolean
          created_at: string
          goal_type: string
          id: string
          reminder_time: string | null
          target_days: number
          target_streak: number
          training_goal_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          goal_type?: string
          id?: string
          reminder_time?: string | null
          target_days?: number
          target_streak?: number
          training_goal_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          goal_type?: string
          id?: string
          reminder_time?: string | null
          target_days?: number
          target_streak?: number
          training_goal_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      adherence_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          streak_count: number
          taken: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          streak_count?: number
          taken?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          streak_count?: number
          taken?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_type: string
          completed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          progress: number | null
          reward_emoji: string | null
          started_at: string | null
          status: string | null
          target: number
          user_id: string
        }
        Insert: {
          challenge_type: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          progress?: number | null
          reward_emoji?: string | null
          started_at?: string | null
          status?: string | null
          target: number
          user_id: string
        }
        Update: {
          challenge_type?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          progress?: number | null
          reward_emoji?: string | null
          started_at?: string | null
          status?: string | null
          target?: number
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          timestamp: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          timestamp?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_summaries: {
        Row: {
          created_at: string
          date: string
          id: string
          message_count: number
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          message_count?: number
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          message_count?: number
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      cycle_baselines: {
        Row: {
          avg_cycle_len: number
          created_at: string | null
          id: string
          last_period_start: string
          luteal_len: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avg_cycle_len: number
          created_at?: string | null
          id?: string
          last_period_start: string
          luteal_len?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avg_cycle_len?: number
          created_at?: string | null
          id?: string
          last_period_start?: string
          luteal_len?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cycle_events: {
        Row: {
          created_at: string | null
          date: string
          id: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      phase_forecasts: {
        Row: {
          confidence: number | null
          date: string
          id: string
          phase: string | null
          user_id: string | null
        }
        Insert: {
          confidence?: number | null
          date: string
          id?: string
          phase?: string | null
          user_id?: string | null
        }
        Update: {
          confidence?: number | null
          date?: string
          id?: string
          phase?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          common_pms_symptoms: string[] | null
          contraception_type: string | null
          country: string | null
          created_at: string | null
          cycle_irregular: boolean | null
          cycle_regularity: string | null
          display_name: string | null
          fitness_goals: string[] | null
          height_cm: number | null
          known_conditions: string[] | null
          pregnancy_status: string | null
          region: string | null
          session_length: string | null
          sleep_quality: string | null
          stress_level: string | null
          timezone: string | null
          training_styles: string[] | null
          trying_to_conceive: boolean | null
          user_id: string
          weekly_training_goal: number | null
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          common_pms_symptoms?: string[] | null
          contraception_type?: string | null
          country?: string | null
          created_at?: string | null
          cycle_irregular?: boolean | null
          cycle_regularity?: string | null
          display_name?: string | null
          fitness_goals?: string[] | null
          height_cm?: number | null
          known_conditions?: string[] | null
          pregnancy_status?: string | null
          region?: string | null
          session_length?: string | null
          sleep_quality?: string | null
          stress_level?: string | null
          timezone?: string | null
          training_styles?: string[] | null
          trying_to_conceive?: boolean | null
          user_id: string
          weekly_training_goal?: number | null
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          common_pms_symptoms?: string[] | null
          contraception_type?: string | null
          country?: string | null
          created_at?: string | null
          cycle_irregular?: boolean | null
          cycle_regularity?: string | null
          display_name?: string | null
          fitness_goals?: string[] | null
          height_cm?: number | null
          known_conditions?: string[] | null
          pregnancy_status?: string | null
          region?: string | null
          session_length?: string | null
          sleep_quality?: string | null
          stress_level?: string | null
          timezone?: string | null
          training_styles?: string[] | null
          trying_to_conceive?: boolean | null
          user_id?: string
          weekly_training_goal?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      reminder_events: {
        Row: {
          channel: string | null
          created_at: string | null
          id: string
          scheduled_for: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          id?: string
          scheduled_for: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          id?: string
          scheduled_for?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reminder_plans: {
        Row: {
          created_at: string | null
          days_of_week: number[] | null
          id: string
          phase_a_time: string | null
          phase_a_training_days_only: boolean | null
          phase_b_time: string | null
          quiet_hours_on: boolean | null
          regimen: string
          reminders_enabled: boolean | null
          time_local: string | null
          timezone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week?: number[] | null
          id?: string
          phase_a_time?: string | null
          phase_a_training_days_only?: boolean | null
          phase_b_time?: string | null
          quiet_hours_on?: boolean | null
          regimen: string
          reminders_enabled?: boolean | null
          time_local?: string | null
          timezone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[] | null
          id?: string
          phase_a_time?: string | null
          phase_a_training_days_only?: boolean | null
          phase_b_time?: string | null
          quiet_hours_on?: boolean | null
          regimen?: string
          reminders_enabled?: boolean | null
          time_local?: string | null
          timezone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          bleeding_flow: string | null
          bloating: number | null
          breast_tenderness: boolean | null
          chills: boolean | null
          cramps: number | null
          craving_types: string[] | null
          cravings: string | null
          date: string
          dizziness: boolean | null
          energy: number | null
          gas: boolean | null
          headache: boolean | null
          hot_flushes: boolean | null
          id: string
          mood: number | null
          mood_states: string[] | null
          nausea: boolean | null
          notes: string | null
          ovulation: boolean | null
          sleep: number | null
          stress_headache: boolean | null
          toilet_issues: boolean | null
          training_load: number | null
          user_id: string | null
        }
        Insert: {
          bleeding_flow?: string | null
          bloating?: number | null
          breast_tenderness?: boolean | null
          chills?: boolean | null
          cramps?: number | null
          craving_types?: string[] | null
          cravings?: string | null
          date: string
          dizziness?: boolean | null
          energy?: number | null
          gas?: boolean | null
          headache?: boolean | null
          hot_flushes?: boolean | null
          id?: string
          mood?: number | null
          mood_states?: string[] | null
          nausea?: boolean | null
          notes?: string | null
          ovulation?: boolean | null
          sleep?: number | null
          stress_headache?: boolean | null
          toilet_issues?: boolean | null
          training_load?: number | null
          user_id?: string | null
        }
        Update: {
          bleeding_flow?: string | null
          bloating?: number | null
          breast_tenderness?: boolean | null
          chills?: boolean | null
          cramps?: number | null
          craving_types?: string[] | null
          cravings?: string | null
          date?: string
          dizziness?: boolean | null
          energy?: number | null
          gas?: boolean | null
          headache?: boolean | null
          hot_flushes?: boolean | null
          id?: string
          mood?: number | null
          mood_states?: string[] | null
          nausea?: boolean | null
          notes?: string | null
          ovulation?: boolean | null
          sleep?: number | null
          stress_headache?: boolean | null
          toilet_issues?: boolean | null
          training_load?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      training_logs: {
        Row: {
          created_at: string | null
          date: string
          fatigue: number | null
          id: string
          notes: string | null
          pb_type: string | null
          pb_value: string | null
          soreness: number | null
          training_load: string | null
          user_id: string
          workout_types: string[] | null
        }
        Insert: {
          created_at?: string | null
          date: string
          fatigue?: number | null
          id?: string
          notes?: string | null
          pb_type?: string | null
          pb_value?: string | null
          soreness?: number | null
          training_load?: string | null
          user_id: string
          workout_types?: string[] | null
        }
        Update: {
          created_at?: string | null
          date?: string
          fatigue?: number | null
          id?: string
          notes?: string | null
          pb_type?: string | null
          pb_value?: string | null
          soreness?: number | null
          training_load?: string | null
          user_id?: string
          workout_types?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      weekly_wins_view: {
        Row: {
          current_streak: number | null
          days_this_week: number | null
          training_days_this_week: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      log_symptom_data: {
        Args: {
          bloating_param?: number
          cramps_param?: number
          date_param: string
          energy_param?: number
          mood_param?: number
          notes_param?: string
          sleep_param?: number
          user_id_param: string
        }
        Returns: boolean
      }
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

export type TablesUpdate<
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
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
