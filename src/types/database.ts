// Temporary type definitions until Supabase types are regenerated
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  topic: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          name?: string | null;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: UserSubscription;
        Insert: {
          id?: string;
          user_id: string;
          plan_type: string;
          status?: string;
          started_at?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_type?: string;
          status?: string;
          expires_at?: string | null;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: {
          id?: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          topic?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          topic?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      identify_topic: {
        Args: { message_content: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
