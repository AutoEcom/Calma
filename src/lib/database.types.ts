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
      audio_listen_events: {
        Row: {
          class_id: string
          completed: boolean
          duration_seconds: number
          id: string
          listened_at: string
          member_id: string
        }
        Insert: {
          class_id: string
          completed?: boolean
          duration_seconds?: number
          id?: string
          listened_at?: string
          member_id: string
        }
        Update: {
          class_id?: string
          completed?: boolean
          duration_seconds?: number
          id?: string
          listened_at?: string
          member_id?: string
        }
        Relationships: []
      }
      audio_sanctuary_waitlist: {
        Row: {
          class_id: string | null
          created_at: string
          email: string
          id: string
          member_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          email: string
          id?: string
          member_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          email?: string
          id?: string
          member_id?: string | null
        }
        Relationships: []
      }
      bundle_classes: {
        Row: {
          bundle_id: string
          class_id: string
          sort_order: number
        }
        Insert: {
          bundle_id: string
          class_id: string
          sort_order?: number
        }
        Update: {
          bundle_id?: string
          class_id?: string
          sort_order?: number
        }
        Relationships: []
      }
      bundles: {
        Row: {
          badge: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          price_in_cents: number
          slug: string
          stripe_price_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          price_in_cents?: number
          slug: string
          stripe_price_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          price_in_cents?: number
          slug?: string
          stripe_price_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          audio_cover_art_url: string | null
          audio_credits: Json
          atmos_source_url: string | null
          audio_hls_atmos_key: string | null
          audio_hls_stereo_key: string | null
          audio_sanctuary_category:
            | Database["public"]["Enums"]["audio_sanctuary_category"]
            | null
          badge: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          image_url: string | null
          instructor_avatar_url: string | null
          instructor_name: string
          is_audio_sanctuary: boolean
          is_featured: boolean
          is_live_active: boolean | null
          max_capacity: number
          mux_playback_id: string | null
          mux_live_stream_id: string | null
          mux_recording_playback_id: string | null
          mux_status: string
          mux_stream_key: string | null
          play_count: number
          price_in_calma: number
          price_in_cents: number
          sanctuary_status: Database["public"]["Enums"]["audio_sanctuary_status"] | null
          scheduled_at: string
          session_level: string
          session_type: string
          slug: string
          stream_key: string | null
          title: string
          usage_tip: string | null
          video_url: string | null
          what_to_expect: Json
        }
        Insert: {
          audio_cover_art_url?: string | null
          audio_credits?: Json
          atmos_source_url?: string | null
          audio_hls_atmos_key?: string | null
          audio_hls_stereo_key?: string | null
          audio_sanctuary_category?:
            | Database["public"]["Enums"]["audio_sanctuary_category"]
            | null
          badge?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          image_url?: string | null
          instructor_avatar_url?: string | null
          instructor_name: string
          is_audio_sanctuary?: boolean
          is_featured?: boolean
          is_live_active?: boolean | null
          max_capacity?: number
          mux_playback_id?: string | null
          mux_live_stream_id?: string | null
          mux_recording_playback_id?: string | null
          mux_status?: string
          mux_stream_key?: string | null
          play_count?: number
          price_in_calma?: number
          price_in_cents?: number
          sanctuary_status?: Database["public"]["Enums"]["audio_sanctuary_status"] | null
          scheduled_at: string
          session_level?: string
          session_type?: string
          slug?: string
          stream_key?: string | null
          title: string
          usage_tip?: string | null
          video_url?: string | null
          what_to_expect?: Json
        }
        Update: {
          audio_cover_art_url?: string | null
          audio_credits?: Json
          atmos_source_url?: string | null
          audio_hls_atmos_key?: string | null
          audio_hls_stereo_key?: string | null
          audio_sanctuary_category?:
            | Database["public"]["Enums"]["audio_sanctuary_category"]
            | null
          badge?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          instructor_avatar_url?: string | null
          instructor_name?: string
          is_audio_sanctuary?: boolean
          is_featured?: boolean
          is_live_active?: boolean | null
          max_capacity?: number
          mux_playback_id?: string | null
          mux_live_stream_id?: string | null
          mux_recording_playback_id?: string | null
          mux_status?: string
          mux_stream_key?: string | null
          play_count?: number
          price_in_calma?: number
          price_in_cents?: number
          sanctuary_status?: Database["public"]["Enums"]["audio_sanctuary_status"] | null
          scheduled_at?: string
          session_level?: string
          session_type?: string
          slug?: string
          stream_key?: string | null
          title?: string
          usage_tip?: string | null
          video_url?: string | null
          what_to_expect?: Json
        }
        Relationships: []
      }
      members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_admin: boolean | null
          last_name: string
          stripe_customer_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id: string
          is_admin?: boolean | null
          last_name: string
          stripe_customer_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_admin?: boolean | null
          last_name?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      user_access: {
        Row: {
          access_granted: Database["public"]["Enums"]["access_type"] | null
          bundle_id: string | null
          class_id: string | null
          granted_at: string | null
          id: string
          member_id: string | null
          payment_method: string | null
          transaction_id: string | null
        }
        Insert: {
          access_granted?: Database["public"]["Enums"]["access_type"] | null
          bundle_id?: string | null
          class_id?: string | null
          granted_at?: string | null
          id?: string
          member_id?: string | null
          payment_method?: string | null
          transaction_id?: string | null
        }
        Update: {
          access_granted?: Database["public"]["Enums"]["access_type"] | null
          bundle_id?: string | null
          class_id?: string | null
          granted_at?: string | null
          id?: string
          member_id?: string | null
          payment_method?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_access_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_access_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bundle_access: {
        Row: {
          bundle_id: string
          granted_at: string
          id: string
          member_id: string
          payment_method: string | null
          transaction_id: string | null
        }
        Insert: {
          bundle_id: string
          granted_at?: string
          id?: string
          member_id: string
          payment_method?: string | null
          transaction_id?: string | null
        }
        Update: {
          bundle_id?: string
          granted_at?: string
          id?: string
          member_id?: string
          payment_method?: string | null
          transaction_id?: string | null
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          class_id: string
          created_at: string
          current_streak: number
          id: string
          last_listen_date: string | null
          longest_streak: number
          member_id: string
          streak_started_on: string | null
          target_days: number
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          current_streak?: number
          id?: string
          last_listen_date?: string | null
          longest_streak?: number
          member_id: string
          streak_started_on?: string | null
          target_days?: number
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          current_streak?: number
          id?: string
          last_listen_date?: string | null
          longest_streak?: number
          member_id?: string
          streak_started_on?: string | null
          target_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          expire: string
          sess: Json
          sid: string
        }
        Insert: {
          expire: string
          sess: Json
          sid: string
        }
        Update: {
          expire?: string
          sess?: Json
          sid?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance_calma: number | null
          member_id: string
          updated_at: string | null
        }
        Insert: {
          balance_calma?: number | null
          member_id: string
          updated_at?: string | null
        }
        Update: {
          balance_calma?: number | null
          member_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      class_booked_counts: {
        Args: { p_ids: string[] }
        Returns: { class_id: string; booked: number }[]
      }
      record_audio_listen: {
        Args: {
          p_class_id: string
          p_completed?: boolean
          p_duration_seconds?: number
          p_play_start?: boolean
        }
        Returns: Database["public"]["Tables"]["user_streaks"]["Row"] | null
      }
    }
    Enums: {
      access_type: "live_only" | "vod_only" | "full_access"
      audio_sanctuary_category:
        | "celestial_rituals"
        | "mind_body_healing"
        | "self_mastery"
        | "daily_frequencies"
        | "neural_reset"
      audio_sanctuary_status: "active" | "coming_soon"
      booking_status: "confirmed" | "cancelled" | "attended"
      class_level: "beginner" | "intermediate" | "advanced" | "all"
      class_type: "yoga" | "pilates" | "private"
      membership_type: "basic" | "premium" | "vip"
      payment_status: "pending" | "paid" | "refunded" | "free"
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
      access_type: ["live_only", "vod_only", "full_access"],
      audio_sanctuary_category: [
        "celestial_rituals",
        "mind_body_healing",
        "self_mastery",
        "daily_frequencies",
        "neural_reset",
      ],
      audio_sanctuary_status: ["active", "coming_soon"],
      booking_status: ["confirmed", "cancelled", "attended"],
      class_level: ["beginner", "intermediate", "advanced", "all"],
      class_type: ["yoga", "pilates", "private"],
      membership_type: ["basic", "premium", "vip"],
      payment_status: ["pending", "paid", "refunded", "free"],
    },
  },
} as const
