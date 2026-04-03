// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
      crawler_logs: {
        Row: {
          category: string | null
          created_at: string | null
          date: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          items_found: number | null
          items_imported: number | null
          source_id: string | null
          status: string | null
          store_name: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          items_found?: number | null
          items_imported?: number | null
          source_id?: string | null
          status?: string | null
          store_name?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          items_found?: number | null
          items_imported?: number | null
          source_id?: string | null
          status?: string | null
          store_name?: string | null
        }
        Relationships: []
      }
      crawler_sources: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          last_scan: string | null
          name: string
          region: string | null
          scan_radius: number | null
          state: string | null
          status: string | null
          type: string | null
          url: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          last_scan?: string | null
          name: string
          region?: string | null
          scan_radius?: number | null
          state?: string | null
          status?: string | null
          type?: string | null
          url: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          last_scan?: string | null
          name?: string
          region?: string | null
          scan_radius?: number | null
          state?: string | null
          status?: string | null
          type?: string | null
          url?: string
        }
        Relationships: []
      }
      discovered_promotions: {
        Row: {
          campaign_name: string | null
          captured_at: string | null
          category: string | null
          country: string | null
          coverage: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          discount: string | null
          discount_percentage: number | null
          discount_rules: string | null
          id: string
          image_url: string | null
          original_price: number | null
          price: number | null
          product_link: string | null
          source_url: string | null
          status: string | null
          store_name: string | null
          title: string
        }
        Insert: {
          campaign_name?: string | null
          captured_at?: string | null
          category?: string | null
          country?: string | null
          coverage?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount?: string | null
          discount_percentage?: number | null
          discount_rules?: string | null
          id?: string
          image_url?: string | null
          original_price?: number | null
          price?: number | null
          product_link?: string | null
          source_url?: string | null
          status?: string | null
          store_name?: string | null
          title: string
        }
        Update: {
          campaign_name?: string | null
          captured_at?: string | null
          category?: string | null
          country?: string | null
          coverage?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount?: string | null
          discount_percentage?: number | null
          discount_rules?: string | null
          id?: string
          image_url?: string | null
          original_price?: number | null
          price?: number | null
          product_link?: string | null
          source_url?: string | null
          status?: string | null
          store_name?: string | null
          title?: string
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


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: crawler_logs
//   id: uuid (not null, default: gen_random_uuid())
//   date: timestamp with time zone (nullable, default: now())
//   store_name: text (nullable)
//   status: text (nullable)
//   items_found: integer (nullable, default: 0)
//   items_imported: integer (nullable, default: 0)
//   source_id: text (nullable)
//   error_message: text (nullable)
//   error_details: jsonb (nullable)
//   category: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: crawler_sources
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   url: text (not null)
//   type: text (nullable, default: 'web'::text)
//   region: text (nullable)
//   country: text (nullable)
//   state: text (nullable)
//   city: text (nullable)
//   scan_radius: numeric (nullable)
//   status: text (nullable, default: 'active'::text)
//   last_scan: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: discovered_promotions
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (nullable)
//   price: numeric (nullable)
//   original_price: numeric (nullable)
//   currency: text (nullable, default: 'BRL'::text)
//   discount: text (nullable)
//   discount_percentage: numeric (nullable)
//   image_url: text (nullable)
//   product_link: text (nullable)
//   source_url: text (nullable)
//   store_name: text (nullable)
//   category: text (nullable)
//   country: text (nullable)
//   status: text (nullable, default: 'pending'::text)
//   captured_at: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (nullable, default: now())
//   campaign_name: text (nullable)
//   coverage: text (nullable, default: 'toda a rede'::text)
//   discount_rules: text (nullable, default: 'percentual'::text)

// --- CONSTRAINTS ---
// Table: crawler_logs
//   PRIMARY KEY crawler_logs_pkey: PRIMARY KEY (id)
// Table: crawler_sources
//   PRIMARY KEY crawler_sources_pkey: PRIMARY KEY (id)
// Table: discovered_promotions
//   PRIMARY KEY discovered_promotions_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: crawler_logs
//   Policy "auth_insert_logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "public_read_logs" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: crawler_sources
//   Policy "auth_all_sources" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_sources" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: discovered_promotions
//   Policy "auth_all_promotions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_promotions" (SELECT, PERMISSIVE) roles={public}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//   

