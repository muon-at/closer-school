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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          age: number | null
          cohort_name: string
          created_at: string
          email: string
          id: string
          motivation: string
          name: string
          phone: string
          status: string
        }
        Insert: {
          age?: number | null
          cohort_name?: string
          created_at?: string
          email: string
          id?: string
          motivation?: string
          name: string
          phone: string
          status?: string
        }
        Update: {
          age?: number | null
          cohort_name?: string
          created_at?: string
          email?: string
          id?: string
          motivation?: string
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      coach_sessions: {
        Row: {
          approved: boolean
          created_at: string
          difficulty: number
          id: string
          persona: string
          scores: Json | null
          transcript: Json
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          difficulty?: number
          id?: string
          persona: string
          scores?: Json | null
          transcript?: Json
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          difficulty?: number
          id?: string
          persona?: string
          scores?: Json | null
          transcript?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string
          id: string
          is_open: boolean
          max_seats: number
          name: string
          starts_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_open?: boolean
          max_seats?: number
          name: string
          starts_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_open?: boolean
          max_seats?: number
          name?: string
          starts_at?: string | null
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          kind: string
          passed: boolean
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          kind: string
          passed?: boolean
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          kind?: string
          passed?: boolean
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guarantee_claims: {
        Row: {
          claim_text: string
          created_at: string
          exam_passed_at: string
          id: string
          resolution_notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          claim_text?: string
          created_at?: string
          exam_passed_at: string
          id?: string
          resolution_notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          claim_text?: string
          created_at?: string
          exam_passed_at?: string
          id?: string
          resolution_notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guarantee_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          location: string
          pay: string
          tags: Json
          title: string
          type: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          location?: string
          pay?: string
          tags?: Json
          title: string
          type?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          location?: string
          pay?: string
          tags?: Json
          title?: string
          type?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string
          duration_min: number
          id: string
          module_slug: string
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          content?: string
          duration_min?: number
          id?: string
          module_slug: string
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          content?: string
          duration_min?: number
          id?: string
          module_slug?: string
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_slug_fkey"
            columns: ["module_slug"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["slug"]
          },
        ]
      }
      modules: {
        Row: {
          ai_gate_required: number
          description: string
          gate: string
          id: string
          slug: string
          sort_order: number
          title: string
          week: number
        }
        Insert: {
          ai_gate_required?: number
          description?: string
          gate?: string
          id?: string
          slug: string
          sort_order?: number
          title: string
          week: number
        }
        Update: {
          ai_gate_required?: number
          description?: string
          gate?: string
          id?: string
          slug?: string
          sort_order?: number
          title?: string
          week?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          created_at: string
          id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          cohort_id: string | null
          created_at: string
          full_name: string
          id: string
          role: string
          streak_days: number
        }
        Insert: {
          age?: number | null
          cohort_id?: string | null
          created_at?: string
          full_name?: string
          id: string
          role?: string
          streak_days?: number
        }
        Update: {
          age?: number | null
          cohort_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: string
          streak_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_fk"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lesson_slug: string
          quiz_score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_slug: string
          quiz_score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_slug?: string
          quiz_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_lesson_slug_fkey"
            columns: ["lesson_slug"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_index: number
          id: string
          is_exam: boolean
          lesson_slug: string
          options: Json
          question: string
        }
        Insert: {
          correct_index: number
          id?: string
          is_exam?: boolean
          lesson_slug: string
          options: Json
          question: string
        }
        Update: {
          correct_index?: number
          id?: string
          is_exam?: boolean
          lesson_slug?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_slug_fkey"
            columns: ["lesson_slug"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["slug"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      real_call_bookings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          sensor: string
          slot: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          sensor?: string
          slot: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          sensor?: string
          slot?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_call_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
