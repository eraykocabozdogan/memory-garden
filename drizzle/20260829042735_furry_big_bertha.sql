CREATE TYPE "public"."memory_date_precision" AS ENUM('none', 'year', 'month', 'day');--> statement-breakpoint
CREATE TYPE "public"."memory_kind" AS ENUM('photo', 'video', 'text');--> statement-breakpoint
CREATE TABLE "memory_day_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"memory_day_id" uuid NOT NULL,
	"province_code" text NOT NULL,
	"province_name" text NOT NULL,
	"district_code" text,
	"district_name" text,
	"longitude" double precision NOT NULL,
	"latitude" double precision NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memory_day_locations_sort_order_nonnegative" CHECK ("memory_day_locations"."sort_order" >= 0),
	CONSTRAINT "memory_day_locations_district_shape" CHECK (("memory_day_locations"."district_code" IS NULL) = ("memory_day_locations"."district_name" IS NULL)),
	CONSTRAINT "memory_day_locations_coordinate_range" CHECK ("memory_day_locations"."longitude" BETWEEN -180 AND 180 AND "memory_day_locations"."latitude" BETWEEN -90 AND 90)
);
--> statement-breakpoint
CREATE TABLE "memory_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"memory_date" date NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "memory_kind" NOT NULL,
	"date_precision" "memory_date_precision" NOT NULL,
	"memory_day_id" uuid,
	"memory_year" integer,
	"memory_month" smallint,
	"text_content" text,
	"object_key" text,
	"original_file_name" text,
	"mime_type" text,
	"file_size_bytes" bigint,
	"width" integer,
	"height" integer,
	"duration_seconds" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memory_items_sort_order_nonnegative" CHECK ("memory_items"."sort_order" >= 0),
	CONSTRAINT "memory_items_date_shape" CHECK (
        ("memory_items"."date_precision" = 'day' AND "memory_items"."memory_day_id" IS NOT NULL AND "memory_items"."memory_year" IS NULL AND "memory_items"."memory_month" IS NULL)
        OR ("memory_items"."date_precision" = 'month' AND "memory_items"."memory_day_id" IS NULL AND "memory_items"."memory_year" IS NOT NULL AND "memory_items"."memory_month" BETWEEN 1 AND 12)
        OR ("memory_items"."date_precision" = 'year' AND "memory_items"."memory_day_id" IS NULL AND "memory_items"."memory_year" IS NOT NULL AND "memory_items"."memory_month" IS NULL)
        OR ("memory_items"."date_precision" = 'none' AND "memory_items"."memory_day_id" IS NULL AND "memory_items"."memory_year" IS NULL AND "memory_items"."memory_month" IS NULL)
      ),
	CONSTRAINT "memory_items_content_shape" CHECK (
        ("memory_items"."kind" = 'text' AND "memory_items"."text_content" IS NOT NULL AND length(btrim("memory_items"."text_content")) > 0 AND "memory_items"."object_key" IS NULL)
        OR ("memory_items"."kind" IN ('photo', 'video') AND "memory_items"."text_content" IS NULL AND "memory_items"."object_key" IS NOT NULL AND length(btrim("memory_items"."object_key")) > 0)
      )
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memory_day_locations" ADD CONSTRAINT "memory_day_locations_memory_day_id_memory_days_id_fk" FOREIGN KEY ("memory_day_id") REFERENCES "public"."memory_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_days" ADD CONSTRAINT "memory_days_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_items" ADD CONSTRAINT "memory_items_memory_day_id_memory_days_id_fk" FOREIGN KEY ("memory_day_id") REFERENCES "public"."memory_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_items" ADD CONSTRAINT "memory_items_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memory_day_locations_day_sort_index" ON "memory_day_locations" USING btree ("memory_day_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "memory_days_memory_date_unique" ON "memory_days" USING btree ("memory_date");--> statement-breakpoint
CREATE INDEX "memory_items_day_sort_index" ON "memory_items" USING btree ("memory_day_id","sort_order");--> statement-breakpoint
CREATE INDEX "memory_items_partial_date_index" ON "memory_items" USING btree ("date_precision","memory_year","memory_month");--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.is_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
  );
$$;--> statement-breakpoint

REVOKE ALL ON FUNCTION public.is_member() FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.is_member() TO authenticated;--> statement-breakpoint

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.memory_days ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.memory_day_locations ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "members can read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_member());--> statement-breakpoint

CREATE POLICY "members can manage memory days"
ON public.memory_days
FOR ALL
TO authenticated
USING (public.is_member())
WITH CHECK (public.is_member());--> statement-breakpoint

CREATE POLICY "members can manage memory items"
ON public.memory_items
FOR ALL
TO authenticated
USING (public.is_member())
WITH CHECK (public.is_member());--> statement-breakpoint

CREATE POLICY "members can manage memory locations"
ON public.memory_day_locations
FOR ALL
TO authenticated
USING (public.is_member())
WITH CHECK (public.is_member());--> statement-breakpoint

REVOKE ALL ON public.profiles, public.memory_days, public.memory_items, public.memory_day_locations FROM anon;--> statement-breakpoint
GRANT SELECT ON public.profiles TO authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_days, public.memory_items, public.memory_day_locations TO authenticated;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.remove_empty_memory_day()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.memory_day_id IS NOT NULL THEN
    DELETE FROM public.memory_days AS day
    WHERE day.id = OLD.memory_day_id
      AND NOT EXISTS (
        SELECT 1
        FROM public.memory_items AS item
        WHERE item.memory_day_id = OLD.memory_day_id
      );
  END IF;

  RETURN OLD;
END;
$$;--> statement-breakpoint

CREATE TRIGGER remove_empty_memory_day_after_item_delete
AFTER DELETE ON public.memory_items
FOR EACH ROW
EXECUTE FUNCTION public.remove_empty_memory_day();
