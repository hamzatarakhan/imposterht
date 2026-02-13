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
      room_players: {
        Row: {
          avatar: string
          has_seen_role: boolean
          id: string
          is_host: boolean
          is_imposter: boolean
          joined_at: string
          name: string
          player_id: string
          player_order: number
          room_id: string
          score: number
          voted_for: string | null
          votes: number
        }
        Insert: {
          avatar?: string
          has_seen_role?: boolean
          id?: string
          is_host?: boolean
          is_imposter?: boolean
          joined_at?: string
          name: string
          player_id: string
          player_order?: number
          room_id: string
          score?: number
          voted_for?: string | null
          votes?: number
        }
        Update: {
          avatar?: string
          has_seen_role?: boolean
          id?: string
          is_host?: boolean
          is_imposter?: boolean
          joined_at?: string
          name?: string
          player_id?: string
          player_order?: number
          room_id?: string
          score?: number
          voted_for?: string | null
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          categories: string | null
          category: string
          code: string
          created_at: string
          current_player_index: number
          discussion_time: number
          discussion_time_enabled: boolean
          host_id: string
          id: string
          imposter_count: number
          player_count: number
          secret_word: string | null
          status: string
          timer_remaining: number | null
          timer_started_at: string | null
          updated_at: string
          winner: string | null
          word_guess_options: string | null
          word_guess_status: string | null
          word_guessed: boolean | null
        }
        Insert: {
          categories?: string | null
          category?: string
          code: string
          created_at?: string
          current_player_index?: number
          discussion_time?: number
          discussion_time_enabled?: boolean
          host_id: string
          id?: string
          imposter_count?: number
          player_count?: number
          secret_word?: string | null
          status?: string
          timer_remaining?: number | null
          timer_started_at?: string | null
          updated_at?: string
          winner?: string | null
          word_guess_options?: string | null
          word_guess_status?: string | null
          word_guessed?: boolean | null
        }
        Update: {
          categories?: string | null
          category?: string
          code?: string
          created_at?: string
          current_player_index?: number
          discussion_time?: number
          discussion_time_enabled?: boolean
          host_id?: string
          id?: string
          imposter_count?: number
          player_count?: number
          secret_word?: string | null
          status?: string
          timer_remaining?: number | null
          timer_started_at?: string | null
          updated_at?: string
          winner?: string | null
          word_guess_options?: string | null
          word_guess_status?: string | null
          word_guessed?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      public_room_players: {
        Row: {
          avatar: string | null
          has_seen_role: boolean | null
          id: string | null
          is_host: boolean | null
          is_imposter: boolean | null
          joined_at: string | null
          name: string | null
          player_id: string | null
          player_order: number | null
          room_id: string | null
          score: number | null
          voted_for: string | null
          votes: number | null
        }
        Insert: {
          avatar?: string | null
          has_seen_role?: boolean | null
          id?: string | null
          is_host?: boolean | null
          is_imposter?: never
          joined_at?: string | null
          name?: string | null
          player_id?: string | null
          player_order?: number | null
          room_id?: string | null
          score?: number | null
          voted_for?: string | null
          votes?: number | null
        }
        Update: {
          avatar?: string | null
          has_seen_role?: boolean | null
          id?: string | null
          is_host?: boolean | null
          is_imposter?: never
          joined_at?: string | null
          name?: string | null
          player_id?: string | null
          player_order?: number | null
          room_id?: string | null
          score?: number | null
          voted_for?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      public_rooms: {
        Row: {
          categories: string | null
          category: string | null
          code: string | null
          created_at: string | null
          current_player_index: number | null
          discussion_time: number | null
          discussion_time_enabled: boolean | null
          host_id: string | null
          id: string | null
          imposter_count: number | null
          player_count: number | null
          status: string | null
          timer_remaining: number | null
          timer_started_at: string | null
          updated_at: string | null
          winner: string | null
          word_guess_options: string | null
          word_guess_status: string | null
          word_guessed: boolean | null
        }
        Insert: {
          categories?: string | null
          category?: string | null
          code?: string | null
          created_at?: string | null
          current_player_index?: number | null
          discussion_time?: number | null
          discussion_time_enabled?: boolean | null
          host_id?: string | null
          id?: string | null
          imposter_count?: number | null
          player_count?: number | null
          status?: string | null
          timer_remaining?: number | null
          timer_started_at?: string | null
          updated_at?: string | null
          winner?: string | null
          word_guess_options?: string | null
          word_guess_status?: string | null
          word_guessed?: boolean | null
        }
        Update: {
          categories?: string | null
          category?: string | null
          code?: string | null
          created_at?: string | null
          current_player_index?: number | null
          discussion_time?: number | null
          discussion_time_enabled?: boolean | null
          host_id?: string | null
          id?: string | null
          imposter_count?: number | null
          player_count?: number | null
          status?: string | null
          timer_remaining?: number | null
          timer_started_at?: string | null
          updated_at?: string | null
          winner?: string | null
          word_guess_options?: string | null
          word_guess_status?: string | null
          word_guessed?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_winner_secure:
        | { Args: { p_room_id: string }; Returns: string }
        | {
            Args: { p_host_player_id: string; p_room_id: string }
            Returns: string
          }
      cleanup_old_rooms: { Args: never; Returns: undefined }
      delete_room_secure: {
        Args: { p_host_player_id: string; p_room_id: string }
        Returns: boolean
      }
      generate_room_code: { Args: never; Returns: string }
      get_finished_game_word: { Args: { p_room_id: string }; Returns: string }
      get_imposters_after_finish: {
        Args: { p_room_id: string }
        Returns: {
          avatar: string
          name: string
          player_id: string
        }[]
      }
      get_my_role: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: boolean
      }
      get_player_word: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: string
      }
      leave_room_secure: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: boolean
      }
      mark_role_seen_secure: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: boolean
      }
      rename_player_secure: {
        Args: {
          p_new_avatar?: string
          p_new_name: string
          p_requester_player_id: string
          p_room_id: string
          p_target_player_id: string
        }
        Returns: boolean
      }
      restart_game_secure: {
        Args: {
          p_host_player_id: string
          p_room_id: string
          p_secret_word: string
        }
        Returns: boolean
      }
      set_word_guess_options_secure: {
        Args: { p_host_player_id: string; p_options: string; p_room_id: string }
        Returns: boolean
      }
      start_game_secure: {
        Args: {
          p_host_player_id: string
          p_room_id: string
          p_secret_word: string
        }
        Returns: boolean
      }
      submit_vote_atomic: {
        Args: {
          p_room_id: string
          p_voted_for_player_id: string
          p_voter_player_id: string
        }
        Returns: boolean
      }
      submit_word_guess: {
        Args: { p_guessed_word: string; p_player_id: string; p_room_id: string }
        Returns: boolean
      }
      update_player_scores: {
        Args: { p_room_id: string; p_winner: string }
        Returns: boolean
      }
      update_room_secure: {
        Args: {
          p_current_player_index?: number
          p_host_player_id: string
          p_room_id: string
          p_status?: string
          p_winner?: string
        }
        Returns: boolean
      }
      update_timer_secure: {
        Args: {
          p_host_player_id: string
          p_room_id: string
          p_timer_remaining?: number
          p_timer_started_at?: string
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
