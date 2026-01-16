export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          username: string;
          avatar_url: string | null;
          grade: string | null;
          school: string | null;
          role: "student" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          username: string;
          avatar_url?: string | null;
          grade?: string | null;
          school?: string | null;
          role?: "student" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          username?: string;
          avatar_url?: string | null;
          grade?: string | null;
          school?: string | null;
          role?: "student" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      textbooks: {
        Row: {
          id: string;
          name: string;
          cover_url: string | null;
          grade: string;
          publisher: string;
          version: string;
          description: string | null;
          is_free: boolean;
          free_units_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cover_url?: string | null;
          grade: string;
          publisher: string;
          version: string;
          description?: string | null;
          is_free?: boolean;
          free_units_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cover_url?: string | null;
          grade?: string;
          publisher?: string;
          version?: string;
          description?: string | null;
          is_free?: boolean;
          free_units_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      units: {
        Row: {
          id: string;
          textbook_id: string;
          name: string;
          order_num: number;
          description: string | null;
          is_free: boolean;
          requires_vip: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          textbook_id: string;
          name: string;
          order_num: number;
          description?: string | null;
          is_free?: boolean;
          requires_vip?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          textbook_id?: string;
          name?: string;
          order_num?: number;
          description?: string | null;
          is_free?: boolean;
          requires_vip?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          unit_id: string;
          name: string;
          order_num: number;
          audio_url: string;
          audio_duration: number;
          subtitle_text: Json | null;
          qr_code_token: string;
          qr_code_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          name: string;
          order_num: number;
          audio_url: string;
          audio_duration: number;
          subtitle_text?: Json | null;
          qr_code_token: string;
          qr_code_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          name?: string;
          order_num?: number;
          audio_url?: string;
          audio_duration?: number;
          subtitle_text?: Json | null;
          qr_code_token?: string;
          qr_code_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          created_at?: string;
        };
      };
      play_history: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          last_position: number;
          play_count: number;
          total_duration: number;
          last_played_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          last_position?: number;
          play_count?: number;
          total_duration?: number;
          last_played_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          last_position?: number;
          play_count?: number;
          total_duration?: number;
          last_played_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      learning_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_duration: number;
          lessons_completed: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total_duration?: number;
          lessons_completed?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_duration?: number;
          lessons_completed?: number;
          created_at?: string;
        };
      };
      play_logs: {
        Row: {
          id: string;
          user_id: string | null;
          lesson_id: string;
          duration: number;
          speed: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          lesson_id: string;
          duration: number;
          speed?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          lesson_id?: string;
          duration?: number;
          speed?: number;
          completed?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
