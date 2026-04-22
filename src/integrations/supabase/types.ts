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
      app_feedback: {
        Row: {
          app_version: string | null
          created_at: string
          id: string
          improvement_text: string | null
          rating: string
          rounds_completed: number | null
          submitter_name: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          id?: string
          improvement_text?: string | null
          rating: string
          rounds_completed?: number | null
          submitter_name?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string
          id?: string
          improvement_text?: string | null
          rating?: string
          rounds_completed?: number | null
          submitter_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_sessions: {
        Row: {
          app_version: string | null
          created_at: string
          game_played: string | null
          id: string
          is_pwa: boolean | null
          language: string | null
          last_seen_at: string
          referrer: string | null
          session_key: string
          user_agent: string | null
          user_avatar: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          game_played?: string | null
          id?: string
          is_pwa?: boolean | null
          language?: string | null
          last_seen_at?: string
          referrer?: string | null
          session_key: string
          user_agent?: string | null
          user_avatar?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string
          game_played?: string | null
          id?: string
          is_pwa?: boolean | null
          language?: string | null
          last_seen_at?: string
          referrer?: string | null
          session_key?: string
          user_agent?: string | null
          user_avatar?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      countries_burned: {
        Row: {
          country_name: string
          created_at: string
          id: string
          room_id: string
        }
        Insert: {
          country_name: string
          created_at?: string
          id?: string
          room_id: string
        }
        Update: {
          country_name?: string
          created_at?: string
          id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_burned_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "countries_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      countries_players: {
        Row: {
          created_at: string
          id: string
          lives: number
          name: string
          player_order: number
          room_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          lives?: number
          name: string
          player_order?: number
          room_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          lives?: number
          name?: string
          player_order?: number
          room_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "countries_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      countries_rooms: {
        Row: {
          code: string
          created_at: string
          host_id: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          host_id: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          host_id?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      guessing_players: {
        Row: {
          avatar: string
          id: string
          is_host: boolean
          joined_at: string
          name: string
          player_id: string
          room_id: string
          wins: number
        }
        Insert: {
          avatar?: string
          id?: string
          is_host?: boolean
          joined_at?: string
          name: string
          player_id: string
          room_id: string
          wins?: number
        }
        Update: {
          avatar?: string
          id?: string
          is_host?: boolean
          joined_at?: string
          name?: string
          player_id?: string
          room_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "guessing_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "guessing_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guessing_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_guessing_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      guessing_rooms: {
        Row: {
          categories: string | null
          code: string
          created_at: string
          current_round: number
          host_id: string
          id: string
          player1_word: string | null
          player2_word: string | null
          presence_enabled: boolean
          round_winner_id: string | null
          status: string
          total_rounds: number
          turn_time: number
          updated_at: string
          voice_chat_enabled: boolean
        }
        Insert: {
          categories?: string | null
          code?: string
          created_at?: string
          current_round?: number
          host_id: string
          id?: string
          player1_word?: string | null
          player2_word?: string | null
          presence_enabled?: boolean
          round_winner_id?: string | null
          status?: string
          total_rounds?: number
          turn_time?: number
          updated_at?: string
          voice_chat_enabled?: boolean
        }
        Update: {
          categories?: string | null
          code?: string
          created_at?: string
          current_round?: number
          host_id?: string
          id?: string
          player1_word?: string | null
          player2_word?: string | null
          presence_enabled?: boolean
          round_winner_id?: string | null
          status?: string
          total_rounds?: number
          turn_time?: number
          updated_at?: string
          voice_chat_enabled?: boolean
        }
        Relationships: []
      }
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
          presence_enabled: boolean
          secret_word: string | null
          status: string
          timer_remaining: number | null
          timer_started_at: string | null
          updated_at: string
          voice_chat_enabled: boolean
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
          presence_enabled?: boolean
          secret_word?: string | null
          status?: string
          timer_remaining?: number | null
          timer_started_at?: string | null
          updated_at?: string
          voice_chat_enabled?: boolean
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
          presence_enabled?: boolean
          secret_word?: string | null
          status?: string
          timer_remaining?: number | null
          timer_started_at?: string | null
          updated_at?: string
          voice_chat_enabled?: boolean
          winner?: string | null
          word_guess_options?: string | null
          word_guess_status?: string | null
          word_guessed?: boolean | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_guessing_players: {
        Row: {
          avatar: string | null
          id: string | null
          is_host: boolean | null
          joined_at: string | null
          name: string | null
          player_id: string | null
          room_id: string | null
          wins: number | null
        }
        Insert: {
          avatar?: string | null
          id?: string | null
          is_host?: boolean | null
          joined_at?: string | null
          name?: string | null
          player_id?: string | null
          room_id?: string | null
          wins?: number | null
        }
        Update: {
          avatar?: string | null
          id?: string | null
          is_host?: boolean | null
          joined_at?: string | null
          name?: string | null
          player_id?: string | null
          room_id?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guessing_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "guessing_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guessing_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_guessing_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      public_guessing_rooms: {
        Row: {
          categories: string | null
          code: string | null
          created_at: string | null
          current_round: number | null
          host_id: string | null
          id: string | null
          presence_enabled: boolean | null
          round_winner_id: string | null
          status: string | null
          total_rounds: number | null
          turn_time: number | null
          updated_at: string | null
          voice_chat_enabled: boolean | null
        }
        Insert: {
          categories?: string | null
          code?: string | null
          created_at?: string | null
          current_round?: number | null
          host_id?: string | null
          id?: string | null
          presence_enabled?: boolean | null
          round_winner_id?: string | null
          status?: string | null
          total_rounds?: number | null
          turn_time?: number | null
          updated_at?: string | null
          voice_chat_enabled?: boolean | null
        }
        Update: {
          categories?: string | null
          code?: string | null
          created_at?: string | null
          current_round?: number | null
          host_id?: string | null
          id?: string | null
          presence_enabled?: boolean | null
          round_winner_id?: string | null
          status?: string | null
          total_rounds?: number | null
          turn_time?: number | null
          updated_at?: string | null
          voice_chat_enabled?: boolean | null
        }
        Relationships: []
      }
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
          presence_enabled: boolean | null
          status: string | null
          timer_remaining: number | null
          timer_started_at: string | null
          updated_at: string | null
          voice_chat_enabled: boolean | null
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
          presence_enabled?: boolean | null
          status?: string | null
          timer_remaining?: number | null
          timer_started_at?: string | null
          updated_at?: string | null
          voice_chat_enabled?: boolean | null
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
          presence_enabled?: boolean | null
          status?: string | null
          timer_remaining?: number | null
          timer_started_at?: string | null
          updated_at?: string | null
          voice_chat_enabled?: boolean | null
          winner?: string | null
          word_guess_options?: string | null
          word_guess_status?: string | null
          word_guessed?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_countries_burned: {
        Args: { p_country_name: string; p_host_id: string; p_room_id: string }
        Returns: boolean
      }
      add_countries_player: {
        Args: { p_host_id: string; p_name: string; p_room_id: string }
        Returns: string
      }
      admin_read_feedback: {
        Args: { p_limit?: number; p_pin: string }
        Returns: {
          app_version: string | null
          created_at: string
          id: string
          improvement_text: string | null
          rating: string
          rounds_completed: number | null
          submitter_name: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "app_feedback"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_read_sessions: {
        Args: { p_limit?: number; p_pin: string }
        Returns: {
          app_version: string | null
          created_at: string
          game_played: string | null
          id: string
          is_pwa: boolean | null
          language: string | null
          last_seen_at: string
          referrer: string | null
          session_key: string
          user_agent: string | null
          user_avatar: string | null
          user_id: string | null
          user_name: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "app_sessions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      calculate_winner_secure:
        | { Args: { p_room_id: string }; Returns: string }
        | {
            Args: { p_host_player_id: string; p_room_id: string }
            Returns: string
          }
      change_guessing_words: {
        Args: {
          p_host_player_id: string
          p_room_id: string
          p_word1: string
          p_word2: string
        }
        Returns: boolean
      }
      cleanup_old_countries_rooms: { Args: never; Returns: undefined }
      cleanup_old_guessing_rooms: { Args: never; Returns: undefined }
      cleanup_old_rooms: { Args: never; Returns: undefined }
      delete_countries_room: {
        Args: { p_host_id: string; p_room_id: string }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      delete_guessing_room: {
        Args: { p_host_player_id: string; p_room_id: string }
        Returns: boolean
      }
      delete_room_secure: {
        Args: { p_host_player_id: string; p_room_id: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_room_code: { Args: never; Returns: string }
      get_finished_game_word: { Args: { p_room_id: string }; Returns: string }
      get_guessing_round_words: {
        Args: { p_room_id: string }
        Returns: {
          player1_word: string
          player2_word: string
        }[]
      }
      get_guessing_spectator_words: {
        Args: { p_room_id: string }
        Returns: {
          player1_word: string
          player2_word: string
        }[]
      }
      get_guessing_word: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: string
      }
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
      leave_guessing_room: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: boolean
      }
      leave_room_secure: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: boolean
      }
      log_app_session: {
        Args: {
          p_app_version?: string
          p_game_played?: string
          p_is_pwa?: boolean
          p_language?: string
          p_referrer?: string
          p_session_key: string
          p_user_agent?: string
          p_user_avatar?: string
          p_user_id?: string
          p_user_name?: string
        }
        Returns: string
      }
      mark_guessing_draw: {
        Args: { p_host_player_id: string; p_room_id: string }
        Returns: boolean
      }
      mark_guessing_winner: {
        Args: {
          p_host_player_id: string
          p_room_id: string
          p_winner_player_id: string
        }
        Returns: boolean
      }
      mark_role_seen_secure: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      next_guessing_round: {
        Args: {
          p_host_player_id: string
          p_room_id: string
          p_word1: string
          p_word2: string
        }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      remove_countries_burned: {
        Args: { p_burned_id: string; p_host_id: string; p_room_id: string }
        Returns: boolean
      }
      remove_countries_player: {
        Args: { p_host_id: string; p_player_id: string; p_room_id: string }
        Returns: boolean
      }
      rename_guessing_player: {
        Args: {
          p_new_name: string
          p_requester_player_id: string
          p_room_id: string
          p_target_player_id: string
        }
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
      replay_guessing_room: {
        Args: {
          p_categories?: string
          p_host_player_id: string
          p_room_id: string
          p_word1: string
          p_word2: string
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
      start_guessing_game: {
        Args: {
          p_host_player_id: string
          p_room_id: string
          p_word1: string
          p_word2: string
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
      swap_countries_players: {
        Args: {
          p_active_player_id: string
          p_eliminated_player_id: string
          p_host_id: string
          p_room_id: string
        }
        Returns: boolean
      }
      update_countries_player_lives: {
        Args: {
          p_delta: number
          p_host_id: string
          p_player_id: string
          p_room_id: string
        }
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
