export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      audios: {
        Row: {
          audio_url: string;
          created_at: string | null;
          duration: number | null;
          id: string;
          is_default: boolean | null;
          lesson_id: string;
          order_num: number | null;
          subtitle_text: string | null;
          title: string;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          audio_url: string;
          created_at?: string | null;
          duration?: number | null;
          id?: string;
          is_default?: boolean | null;
          lesson_id: string;
          order_num?: number | null;
          subtitle_text?: string | null;
          title: string;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          audio_url?: string;
          created_at?: string | null;
          duration?: number | null;
          id?: string;
          is_default?: boolean | null;
          lesson_id?: string;
          order_num?: number | null;
          subtitle_text?: string | null;
          title?: string;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audios_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      class_students: {
        Row: {
          class_id: string;
          id: string;
          joined_at: string | null;
          student_id: string;
        };
        Insert: {
          class_id: string;
          id?: string;
          joined_at?: string | null;
          student_id: string;
        };
        Update: {
          class_id?: string;
          id?: string;
          joined_at?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          admin_id: string | null;
          created_at: string | null;
          grade: string;
          id: string;
          name: string;
          subscription_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          admin_id?: string | null;
          created_at?: string | null;
          grade: string;
          id?: string;
          name: string;
          subscription_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          admin_id?: string | null;
          created_at?: string | null;
          grade?: string;
          id?: string;
          name?: string;
          subscription_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "classes_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: {
          created_at: string | null;
          id: string;
          lesson_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          lesson_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          lesson_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_stats: {
        Row: {
          created_at: string | null;
          date: string;
          id: string;
          lessons_completed: number | null;
          total_duration: number | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          id?: string;
          lessons_completed?: number | null;
          total_duration?: number | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          id?: string;
          lessons_completed?: number | null;
          total_duration?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_stats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          audio_duration: number;
          audio_url: string;
          created_at: string | null;
          id: string;
          name: string;
          order_num: number;
          qr_code_expires_at: string | null;
          qr_code_token: string;
          subtitle_text: Json | null;
          unit_id: string;
          updated_at: string | null;
        };
        Insert: {
          audio_duration: number;
          audio_url: string;
          created_at?: string | null;
          id?: string;
          name: string;
          order_num: number;
          qr_code_expires_at?: string | null;
          qr_code_token: string;
          subtitle_text?: Json | null;
          unit_id: string;
          updated_at?: string | null;
        };
        Update: {
          audio_duration?: number;
          audio_url?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          order_num?: number;
          qr_code_expires_at?: string | null;
          qr_code_token?: string;
          subtitle_text?: Json | null;
          unit_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      operation_logs: {
        Row: {
          action: string;
          created_at: string | null;
          id: string;
          ip_address: string | null;
          module: string;
          new_value: Json | null;
          old_value: Json | null;
          resource_id: string | null;
          resource_type: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          module: string;
          new_value?: Json | null;
          old_value?: Json | null;
          resource_id?: string | null;
          resource_type?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          module?: string;
          new_value?: Json | null;
          old_value?: Json | null;
          resource_id?: string | null;
          resource_type?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "operation_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      play_history: {
        Row: {
          created_at: string | null;
          id: string;
          last_played_at: string | null;
          last_position: number | null;
          lesson_id: string;
          play_count: number | null;
          total_duration: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          last_played_at?: string | null;
          last_position?: number | null;
          lesson_id: string;
          play_count?: number | null;
          total_duration?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          last_played_at?: string | null;
          last_position?: number | null;
          lesson_id?: string;
          play_count?: number | null;
          total_duration?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "play_history_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "play_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      play_logs: {
        Row: {
          completed: boolean | null;
          created_at: string | null;
          duration: number;
          id: string;
          lesson_id: string;
          speed: number | null;
          user_id: string | null;
        };
        Insert: {
          completed?: boolean | null;
          created_at?: string | null;
          duration: number;
          id?: string;
          lesson_id: string;
          speed?: number | null;
          user_id?: string | null;
        };
        Update: {
          completed?: boolean | null;
          created_at?: string | null;
          duration?: number;
          id?: string;
          lesson_id?: string;
          speed?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "play_logs_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "play_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          end_date: string;
          id: string;
          notes: string | null;
          payment_status: string | null;
          school_contact: string | null;
          school_name: string;
          start_date: string;
          status: string;
          student_count: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          end_date: string;
          id?: string;
          notes?: string | null;
          payment_status?: string | null;
          school_contact?: string | null;
          school_name: string;
          start_date: string;
          status?: string;
          student_count?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          end_date?: string;
          id?: string;
          notes?: string | null;
          payment_status?: string | null;
          school_contact?: string | null;
          school_name?: string;
          start_date?: string;
          status?: string;
          student_count?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      textbooks: {
        Row: {
          cover_url: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          free_units_count: number | null;
          grade: string;
          id: string;
          is_free: boolean | null;
          name: string;
          publisher: string;
          updated_at: string | null;
          version: string;
        };
        Insert: {
          cover_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          free_units_count?: number | null;
          grade: string;
          id?: string;
          is_free?: boolean | null;
          name: string;
          publisher: string;
          updated_at?: string | null;
          version: string;
        };
        Update: {
          cover_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          free_units_count?: number | null;
          grade?: string;
          id?: string;
          is_free?: boolean | null;
          name?: string;
          publisher?: string;
          updated_at?: string | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "textbooks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      units: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_free: boolean | null;
          name: string;
          order_num: number;
          requires_vip: boolean | null;
          textbook_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_free?: boolean | null;
          name: string;
          order_num: number;
          requires_vip?: boolean | null;
          textbook_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_free?: boolean | null;
          name?: string;
          order_num?: number;
          requires_vip?: boolean | null;
          textbook_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "units_textbook_id_fkey";
            columns: ["textbook_id"];
            isOneToOne: false;
            referencedRelation: "textbooks";
            referencedColumns: ["id"];
          },
        ];
      };
      user_stats: {
        Row: {
          last_activity_at: string | null;
          streak_days: number | null;
          total_audio_seconds: number | null;
          total_learning_minutes: number | null;
          total_lessons_completed: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          last_activity_at?: string | null;
          streak_days?: number | null;
          total_audio_seconds?: number | null;
          total_learning_minutes?: number | null;
          total_lessons_completed?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          last_activity_at?: string | null;
          streak_days?: number | null;
          total_audio_seconds?: number | null;
          total_learning_minutes?: number | null;
          total_lessons_completed?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          grade: string | null;
          id: string;
          last_login_at: string | null;
          login_count: number | null;
          phone: string | null;
          role: string;
          school: string | null;
          status: string;
          student_id: string | null;
          subscription_id: string | null;
          updated_at: string | null;
          username: string;
          wechat_openid: string | null;
          wechat_unionid: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          grade?: string | null;
          id?: string;
          last_login_at?: string | null;
          login_count?: number | null;
          phone?: string | null;
          role?: string;
          school?: string | null;
          status?: string;
          student_id?: string | null;
          subscription_id?: string | null;
          updated_at?: string | null;
          username: string;
          wechat_openid?: string | null;
          wechat_unionid?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          grade?: string | null;
          id?: string;
          last_login_at?: string | null;
          login_count?: number | null;
          phone?: string | null;
          role?: string;
          school?: string | null;
          status?: string;
          student_id?: string | null;
          subscription_id?: string | null;
          updated_at?: string | null;
          username?: string;
          wechat_openid?: string | null;
          wechat_unionid?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
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
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
