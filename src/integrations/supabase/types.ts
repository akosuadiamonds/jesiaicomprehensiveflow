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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      classroom_announcements: {
        Row: {
          classroom_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          teacher_id: string
          title: string
        }
        Insert: {
          classroom_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          teacher_id: string
          title: string
        }
        Update: {
          classroom_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_announcements_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_resources: {
        Row: {
          classroom_id: string
          content: Json | null
          created_at: string
          id: string
          is_published: boolean | null
          resource_type: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          classroom_id: string
          content?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          resource_type: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          content?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          resource_type?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_resources_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_students: {
        Row: {
          approval_status: string
          classroom_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          student_id: string
          subscription_expires_at: string | null
          subscription_status: string | null
        }
        Insert: {
          approval_status?: string
          classroom_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          student_id: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
        }
        Update: {
          approval_status?: string
          classroom_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          student_id?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          classroom_type: Database["public"]["Enums"]["classroom_type"]
          created_at: string
          currency: string | null
          description: string | null
          id: string
          invite_code: string
          is_active: boolean | null
          max_students: number | null
          monthly_fee: number | null
          name: string
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          classroom_type?: Database["public"]["Enums"]["classroom_type"]
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          invite_code: string
          is_active?: boolean | null
          max_students?: number | null
          monthly_fee?: number | null
          name: string
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          classroom_type?: Database["public"]["Enums"]["classroom_type"]
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean | null
          max_students?: number | null
          monthly_fee?: number | null
          name?: string
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source: string
          student_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source: string
          student_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          student_id?: string
          transaction_type?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          created_at: string
          id: string
          last_accessed_at: string | null
          lessons_completed: number
          progress_percent: number
          student_id: string
          subject: string
          topic: string
          total_lessons: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lessons_completed?: number
          progress_percent?: number
          student_id: string
          subject: string
          topic: string
          total_lessons?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lessons_completed?: number
          progress_percent?: number
          student_id?: string
          subject?: string
          topic?: string
          total_lessons?: number
          updated_at?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number
          created_at: string
          difficulty_level: string | null
          id: string
          questions_data: Json | null
          session_type: string
          student_id: string
          subject: string
          time_spent_seconds: number | null
          topic: string
          total_questions: number
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          difficulty_level?: string | null
          id?: string
          questions_data?: Json | null
          session_type?: string
          student_id: string
          subject: string
          time_spent_seconds?: number | null
          topic: string
          total_questions?: number
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          difficulty_level?: string | null
          id?: string
          questions_data?: Json | null
          session_type?: string
          student_id?: string
          subject?: string
          time_spent_seconds?: number | null
          topic?: string
          total_questions?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class_grade: string | null
          created_at: string
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          parent_contact: string | null
          phone_number: string | null
          school_name: string | null
          selected_plan: string | null
          subjects: string[] | null
          updated_at: string
          user_id: string
          user_role: string | null
        }
        Insert: {
          class_grade?: string | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          parent_contact?: string | null
          phone_number?: string | null
          school_name?: string | null
          selected_plan?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id: string
          user_role?: string | null
        }
        Update: {
          class_grade?: string | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          parent_contact?: string | null
          phone_number?: string | null
          school_name?: string | null
          selected_plan?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      saved_exams: {
        Row: {
          class: string
          created_at: string
          duration: string
          exam_name: string
          id: string
          level: string
          school_name: string
          section_a: Json
          section_b: Json
          status: string
          subject: string
          teacher_id: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          class: string
          created_at?: string
          duration: string
          exam_name: string
          id?: string
          level: string
          school_name: string
          section_a?: Json
          section_b?: Json
          status?: string
          subject: string
          teacher_id: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          class?: string
          created_at?: string
          duration?: string
          exam_name?: string
          id?: string
          level?: string
          school_name?: string
          section_a?: Json
          section_b?: Json
          status?: string
          subject?: string
          teacher_id?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
      saved_lesson_plans: {
        Row: {
          class: string
          class_size: number
          content_standard: string
          core_competencies: string
          created_at: string
          duration: number
          id: string
          indicator: string
          keywords: Json
          lesson_note: string
          performance_indicator: string
          phases: Json
          references_text: string
          status: string
          strand: string
          sub_strand: string
          subject: string
          teacher_id: string
          teaching_resources: string
          updated_at: string
        }
        Insert: {
          class: string
          class_size?: number
          content_standard?: string
          core_competencies?: string
          created_at?: string
          duration?: number
          id?: string
          indicator?: string
          keywords?: Json
          lesson_note?: string
          performance_indicator?: string
          phases?: Json
          references_text?: string
          status?: string
          strand?: string
          sub_strand?: string
          subject: string
          teacher_id: string
          teaching_resources?: string
          updated_at?: string
        }
        Update: {
          class?: string
          class_size?: number
          content_standard?: string
          core_competencies?: string
          created_at?: string
          duration?: number
          id?: string
          indicator?: string
          keywords?: Json
          lesson_note?: string
          performance_indicator?: string
          phases?: Json
          references_text?: string
          status?: string
          strand?: string
          sub_strand?: string
          subject?: string
          teacher_id?: string
          teaching_resources?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_quizzes: {
        Row: {
          access_code: string
          assigned_classroom_id: string | null
          class: string
          created_at: string
          dok_level: number
          duration: number
          id: string
          is_locked: boolean
          level: string
          question_formats: string[]
          questions: Json
          status: string
          subject: string
          teacher_id: string
          title: string
          total_marks: number
          type: string
          updated_at: string
        }
        Insert: {
          access_code?: string
          assigned_classroom_id?: string | null
          class: string
          created_at?: string
          dok_level?: number
          duration?: number
          id?: string
          is_locked?: boolean
          level?: string
          question_formats?: string[]
          questions?: Json
          status?: string
          subject: string
          teacher_id: string
          title: string
          total_marks?: number
          type?: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          assigned_classroom_id?: string | null
          class?: string
          created_at?: string
          dok_level?: number
          duration?: number
          id?: string
          is_locked?: boolean
          level?: string
          question_formats?: string[]
          questions?: Json
          status?: string
          subject?: string
          teacher_id?: string
          title?: string
          total_marks?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_coins: {
        Row: {
          coins: number
          created_at: string
          id: string
          last_login_date: string | null
          streak_days: number
          student_id: string
          total_earned: number
          updated_at: string
        }
        Insert: {
          coins?: number
          created_at?: string
          id?: string
          last_login_date?: string | null
          streak_days?: number
          student_id: string
          total_earned?: number
          updated_at?: string
        }
        Update: {
          coins?: number
          created_at?: string
          id?: string
          last_login_date?: string | null
          streak_days?: number
          student_id?: string
          total_earned?: number
          updated_at?: string
        }
        Relationships: []
      }
      student_redeemed_rewards: {
        Row: {
          id: string
          redeemed_at: string
          reward_id: string
          student_id: string
        }
        Insert: {
          id?: string
          redeemed_at?: string
          reward_id: string
          student_id: string
        }
        Update: {
          id?: string
          redeemed_at?: string
          reward_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_redeemed_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "student_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      student_rewards: {
        Row: {
          cost: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          reward_type: string
        }
        Insert: {
          cost: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          reward_type?: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          reward_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invite_code: { Args: never; Returns: string }
      get_classroom_ids_for_student: {
        Args: { p_student_id: string }
        Returns: string[]
      }
      get_classroom_ids_for_teacher: {
        Args: { p_teacher_id: string }
        Returns: string[]
      }
    }
    Enums: {
      classroom_type: "school" | "private"
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
    Enums: {
      classroom_type: ["school", "private"],
    },
  },
} as const
