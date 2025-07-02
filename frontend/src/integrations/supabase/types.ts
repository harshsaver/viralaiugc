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
      demo: {
        Row: {
          created_at: string
          demo_link: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          demo_link: string
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          demo_link?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_images: {
        Row: {
          created_at: string
          id: number
          prompt: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          prompt?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          prompt?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      generated_videos: {
        Row: {
          caption: string | null
          completed_at: string | null
          created_at: string
          demo_id: number | null
          error: string | null
          id: string
          remotion: Json | null
          remotion_video: string | null
          sound_id: number | null
          status: string
          template_id: number | null
          text_alignment: Database["public"]["Enums"]["text_alignment"]
          user_id: string
          video_alignment: Database["public"]["Enums"]["video_alignment"] | null
          video_type: Database["public"]["Enums"]["video_type"]
        }
        Insert: {
          caption?: string | null
          completed_at?: string | null
          created_at?: string
          demo_id?: number | null
          error?: string | null
          id?: string
          remotion?: Json | null
          remotion_video?: string | null
          sound_id?: number | null
          status?: string
          template_id?: number | null
          text_alignment: Database["public"]["Enums"]["text_alignment"]
          user_id: string
          video_alignment?:
            | Database["public"]["Enums"]["video_alignment"]
            | null
          video_type: Database["public"]["Enums"]["video_type"]
        }
        Update: {
          caption?: string | null
          completed_at?: string | null
          created_at?: string
          demo_id?: number | null
          error?: string | null
          id?: string
          remotion?: Json | null
          remotion_video?: string | null
          sound_id?: number | null
          status?: string
          template_id?: number | null
          text_alignment?: Database["public"]["Enums"]["text_alignment"]
          user_id?: string
          video_alignment?:
            | Database["public"]["Enums"]["video_alignment"]
            | null
          video_type?: Database["public"]["Enums"]["video_type"]
        }
        Relationships: [
          {
            foreignKeyName: "generated_videos_demo_id_fkey"
            columns: ["demo_id"]
            isOneToOne: false
            referencedRelation: "demo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_videos_sound_id_fkey"
            columns: ["sound_id"]
            isOneToOne: false
            referencedRelation: "sound"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_videos_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: number
          created_at: string
          app_name: string
          short_description: string
          long_description: string | null
          target_audience: string | null
          example_hooks: string | null
          example_hashtags: string | null
          value_proposition: string | null
          social_strategy: string | null
          user_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          app_name: string
          short_description: string
          long_description?: string | null
          target_audience?: string | null
          example_hooks?: string | null
          example_hashtags?: string | null
          value_proposition?: string | null
          social_strategy?: string | null
          user_id?: string
        }
        Update: {
          id?: number
          created_at?: string
          app_name?: string
          short_description?: string
          long_description?: string | null
          target_audience?: string | null
          example_hooks?: string | null
          example_hashtags?: string | null
          value_proposition?: string | null
          social_strategy?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits: number
          email: string | null
          id: string
          plan: Database["public"]["Enums"]["plan"]
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          id: string
          plan?: Database["public"]["Enums"]["plan"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      sound: {
        Row: {
          created_at: string
          id: number
          name: string
          sound_link: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string
          sound_link: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          sound_link?: string
          user_id?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          id: number
          image_link: string | null
          template_type: Database["public"]["Enums"]["template_type"] | null
          user_id: string | null
          video_link: string
        }
        Insert: {
          created_at?: string
          id?: number
          image_link?: string | null
          template_type?: Database["public"]["Enums"]["template_type"] | null
          user_id?: string | null
          video_link: string
        }
        Update: {
          created_at?: string
          id?: number
          image_link?: string | null
          template_type?: Database["public"]["Enums"]["template_type"] | null
          user_id?: string | null
          video_link?: string
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
      plan: "free" | "pro" | "ultra"
      template_type: "aiavatar" | "game" | "usergenerated" | "gif"
      text_alignment: "top" | "center" | "bottom"
      video_alignment: "side" | "top" | "serial"
      video_type: "aiugc" | "meme" | "gif"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
