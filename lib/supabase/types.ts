export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      content: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          content_type: string;
          topic: string;
          generated_text: string;
          publish_date: string;
          publish_time: string;
          status: string;
          owner: string;
          calendar_event_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          content_type: string;
          topic: string;
          generated_text: string;
          publish_date: string;
          publish_time: string;
          status?: string;
          owner: string;
          calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          content_type?: string;
          topic?: string;
          generated_text?: string;
          publish_date?: string;
          publish_time?: string;
          status?: string;
          owner?: string;
          calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      research_urls: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          title: string;
          category: string;
          scrape_frequency: string;
          is_active: boolean;
          last_scraped: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          title: string;
          category: string;
          scrape_frequency: string;
          is_active?: boolean;
          last_scraped?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          title?: string;
          category?: string;
          scrape_frequency?: string;
          is_active?: boolean;
          last_scraped?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "research_urls_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      research_content: {
        Row: {
          id: string;
          research_url_id: string;
          raw_content: string;
          summary: string | null;
          scraped_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          research_url_id: string;
          raw_content: string;
          summary?: string | null;
          scraped_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          research_url_id?: string;
          raw_content?: string;
          summary?: string | null;
          scraped_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "research_content_research_url_id_fkey";
            columns: ["research_url_id"];
            isOneToOne: false;
            referencedRelation: "research_urls";
            referencedColumns: ["id"];
          },
        ];
      };
      topic_keywords: {
        Row: {
          id: string;
          user_id: string;
          keyword: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          keyword: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          keyword?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topic_keywords_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      excluded_topics: {
        Row: {
          id: string;
          user_id: string;
          topic: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "excluded_topics_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      phrase_patterns: {
        Row: {
          id: string;
          user_id: string;
          phrase: string;
          is_forbidden: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phrase: string;
          is_forbidden?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phrase?: string;
          is_forbidden?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "phrase_patterns_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          weekly_generation_day: number;
          weekly_generation_time: string;
          auto_approve_enabled: boolean;
          notification_email: string;
          google_refresh_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weekly_generation_day?: number;
          weekly_generation_time?: string;
          auto_approve_enabled?: boolean;
          notification_email?: string;
          google_refresh_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weekly_generation_day?: number;
          weekly_generation_time?: string;
          auto_approve_enabled?: boolean;
          notification_email?: string;
          google_refresh_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          week_start_date: string;
          items_generated: number;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          week_start_date: string;
          items_generated?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          week_start_date?: string;
          items_generated?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "generation_jobs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_content: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
          filter_user_id?: string;
        };
        Returns: {
          id: string;
          topic: string;
          generated_text: string;
          similarity: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
