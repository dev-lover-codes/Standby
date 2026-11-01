export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EventKind = "wedding" | "birthday" | "community" | "other";
export type VendorStatus = "to_call" | "quoted" | "booked" | "confirmed";

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          kind: EventKind;
          event_date: string;
          guest_count: number;
          budget_total: number;
          outdoor: boolean;
          brief: string;
          plan: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string;
          title: string;
          kind: EventKind;
          event_date: string;
          guest_count: number;
          budget_total: number;
          outdoor?: boolean;
          brief: string;
          plan?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          kind?: EventKind;
          event_date?: string;
          guest_count?: number;
          budget_total?: number;
          outdoor?: boolean;
          brief?: string;
          plan?: Json | null;
          created_at?: string;
        };
      };
      risks: {
        Row: {
          id: string;
          event_id: string;
          owner_id: string;
          title: string;
          likelihood: number;
          impact: number;
          plan_b: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          owner_id?: string;
          title: string;
          likelihood: number;
          impact: number;
          plan_b: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          owner_id?: string;
          title?: string;
          likelihood?: number;
          impact?: number;
          plan_b?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          event_id: string;
          owner_id: string;
          title: string;
          duration_days: number;
          depends_on: string[];
          due_date: string | null;
          done: boolean;
        };
        Insert: {
          id?: string;
          event_id: string;
          owner_id?: string;
          title: string;
          duration_days: number;
          depends_on?: string[];
          due_date?: string | null;
          done?: boolean;
        };
        Update: {
          id?: string;
          event_id?: string;
          owner_id?: string;
          title?: string;
          duration_days?: number;
          depends_on?: string[];
          due_date?: string | null;
          done?: boolean;
        };
      };
      vendors: {
        Row: {
          id: string;
          event_id: string;
          owner_id: string;
          category: string;
          name: string;
          status: VendorStatus;
          quote: number | null;
          deadline: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          owner_id?: string;
          category: string;
          name?: string;
          status?: VendorStatus;
          quote?: number | null;
          deadline?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          owner_id?: string;
          category?: string;
          name?: string;
          status?: VendorStatus;
          quote?: number | null;
          deadline?: string | null;
        };
      };
      budget_items: {
        Row: {
          id: string;
          event_id: string;
          owner_id: string;
          name: string;
          min_cost: number;
          likely_cost: number;
          max_cost: number;
          scales_with_guests: boolean;
        };
        Insert: {
          id?: string;
          event_id: string;
          owner_id?: string;
          name: string;
          min_cost: number;
          likely_cost: number;
          max_cost: number;
          scales_with_guests?: boolean;
        };
        Update: {
          id?: string;
          event_id?: string;
          owner_id?: string;
          name?: string;
          min_cost?: number;
          likely_cost?: number;
          max_cost?: number;
          scales_with_guests?: boolean;
        };
      };
      share_links: {
        Row: {
          token: string;
          event_id: string;
          owner_id: string;
          expires_at: string;
        };
        Insert: {
          token: string;
          event_id: string;
          owner_id?: string;
          expires_at: string;
        };
        Update: {
          token?: string;
          event_id?: string;
          owner_id?: string;
          expires_at?: string;
        };
      };
      ai_usage: {
        Row: {
          owner_id: string;
          day: string;
          count: number;
        };
        Insert: {
          owner_id: string;
          day?: string;
          count?: number;
        };
        Update: {
          owner_id?: string;
          day?: string;
          count?: number;
        };
      };
    };
    Functions: {
      ping: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      consume_ai_quota: {
        Args: { p_max: number };
        Returns: boolean;
      };
      get_shared_event: {
        Args: { p_token: string };
        Returns: Json | null;
      };
    };
  };
}
