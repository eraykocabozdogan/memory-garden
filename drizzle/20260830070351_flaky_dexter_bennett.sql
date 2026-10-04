CREATE TYPE "public"."media_asset_status" AS ENUM('queued', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "media_assets" (
	"memory_item_id" uuid PRIMARY KEY NOT NULL,
	"status" "media_asset_status" DEFAULT 'queued' NOT NULL,
	"source_object_key" text NOT NULL,
	"display_object_key" text,
	"preview_object_key" text,
	"original_file_name" text NOT NULL,
	"source_mime_type" text NOT NULL,
	"source_size_bytes" bigint NOT NULL,
	"display_mime_type" text,
	"display_size_bytes" bigint,
	"width" integer,
	"height" integer,
	"duration_seconds" integer,
	"processing_run_id" uuid NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"error_code" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_attempt_count_nonnegative" CHECK ("media_assets"."attempt_count" >= 0),
	CONSTRAINT "media_assets_ready_shape" CHECK (
        ("media_assets"."status" <> 'ready')
        OR (
          "media_assets"."display_object_key" IS NOT NULL
          AND "media_assets"."preview_object_key" IS NOT NULL
          AND "media_assets"."display_mime_type" IS NOT NULL
          AND "media_assets"."display_size_bytes" IS NOT NULL
          AND "media_assets"."width" IS NOT NULL
          AND "media_assets"."height" IS NOT NULL
        )
      )
);
--> statement-breakpoint
ALTER TABLE "memory_items" DROP CONSTRAINT "memory_items_content_shape";--> statement-breakpoint
DROP INDEX "memory_items_object_key_unique";--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_memory_item_id_memory_items_id_fk" FOREIGN KEY ("memory_item_id") REFERENCES "public"."memory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_source_object_key_unique" ON "media_assets" USING btree ("source_object_key");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_display_object_key_unique" ON "media_assets" USING btree ("display_object_key");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_preview_object_key_unique" ON "media_assets" USING btree ("preview_object_key");--> statement-breakpoint
CREATE INDEX "media_assets_status_index" ON "media_assets" USING btree ("status","updated_at");--> statement-breakpoint
ALTER TABLE "memory_items" DROP COLUMN "object_key";--> statement-breakpoint
ALTER TABLE "memory_items" DROP COLUMN "original_file_name";--> statement-breakpoint
ALTER TABLE "memory_items" DROP COLUMN "mime_type";--> statement-breakpoint
ALTER TABLE "memory_items" DROP COLUMN "file_size_bytes";--> statement-breakpoint
ALTER TABLE "memory_items" DROP COLUMN "width";--> statement-breakpoint
ALTER TABLE "memory_items" DROP COLUMN "height";--> statement-breakpoint
ALTER TABLE "memory_items" DROP COLUMN "duration_seconds";--> statement-breakpoint
ALTER TABLE "memory_items" ADD CONSTRAINT "memory_items_content_shape" CHECK (
        ("memory_items"."kind" = 'text' AND "memory_items"."text_content" IS NOT NULL AND length(btrim("memory_items"."text_content")) > 0)
        OR ("memory_items"."kind" IN ('photo', 'video') AND "memory_items"."text_content" IS NULL)
      );--> statement-breakpoint

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "members can manage media assets"
ON public.media_assets
FOR ALL
TO authenticated
USING (public.is_member())
WITH CHECK (public.is_member());--> statement-breakpoint

REVOKE ALL ON public.media_assets FROM anon;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
