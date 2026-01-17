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
          role: "student" | "admin" | "super_admin";
          status: "active" | "suspended" | "banned";
          last_login_at: string | null;
          login_count: number;
          wechat_openid: string | null;
          wechat_unionid: string | null;
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
          role?: "student" | "admin" | "super_admin";
          status?: "active" | "suspended" | "banned";
          last_login_at?: string | null;
          login_count?: number;
          wechat_openid?: string | null;
          wechat_unionid?: string | null;
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
          role?: "student" | "admin" | "super_admin";
          status?: "active" | "suspended" | "banned";
          last_login_at?: string | null;
          login_count?: number;
          wechat_openid?: string | null;
          wechat_unionid?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      // Admin panel tables
      user_stats: {
        Row: {
          user_id: string;
          total_learning_minutes: number;
          total_lessons_completed: number;
          total_audio_seconds: number;
          streak_days: number;
          last_activity_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_learning_minutes?: number;
          total_lessons_completed?: number;
          total_audio_seconds?: number;
          streak_days?: number;
          last_activity_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          total_learning_minutes?: number;
          total_lessons_completed?: number;
          total_audio_seconds?: number;
          streak_days?: number;
          last_activity_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_records: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          played_seconds: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          played_seconds?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          played_seconds?: number;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      operation_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          module: string;
          resource_type: string | null;
          resource_id: string | null;
          old_value: Json | null;
          new_value: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          module: string;
          resource_type?: string | null;
          resource_id?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          module?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audios: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          type: "main" | "listening" | "practice";
          audio_url: string;
          duration: number | null;
          order_num: number;
          is_default: boolean;
          subtitle_text: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          type?: "main" | "listening" | "practice";
          audio_url: string;
          duration?: number | null;
          order_num?: number;
          is_default?: boolean;
          subtitle_text?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          type?: "main" | "listening" | "practice";
          audio_url?: string;
          duration?: number | null;
          order_num?: number;
          is_default?: boolean;
          subtitle_text?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
