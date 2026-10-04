CREATE TABLE "diary_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"content" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() + interval '24 hours' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "diary_entries_content_nonempty" CHECK (length(btrim("diary_entries"."content")) > 0),
	CONSTRAINT "diary_entries_lifetime_24_hours" CHECK ("diary_entries"."expires_at" = "diary_entries"."published_at" + interval '24 hours')
);
--> statement-breakpoint
CREATE TABLE "diary_flower_responses" (
	"entry_id" uuid PRIMARY KEY NOT NULL,
	"responder_id" uuid NOT NULL,
	"flower_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "diary_flower_responses_flower_nonempty" CHECK (length(btrim("diary_flower_responses"."flower_id")) > 0)
);
--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_flower_responses" ADD CONSTRAINT "diary_flower_responses_entry_id_diary_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."diary_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_flower_responses" ADD CONSTRAINT "diary_flower_responses_responder_id_profiles_id_fk" FOREIGN KEY ("responder_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diary_entries_author_published_index" ON "diary_entries" USING btree ("author_id","published_at");--> statement-breakpoint
CREATE INDEX "diary_entries_expires_index" ON "diary_entries" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "diary_flower_responses_responder_index" ON "diary_flower_responses" USING btree ("responder_id");--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.validate_diary_flower_response()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  entry_author_id uuid;
  entry_expires_at timestamptz;
BEGIN
  SELECT author_id, expires_at
  INTO entry_author_id, entry_expires_at
  FROM public.diary_entries
  WHERE id = NEW.entry_id;

  IF entry_author_id = NEW.responder_id THEN
    RAISE EXCEPTION 'Authors cannot respond to their own diary entry'
      USING ERRCODE = '23514';
  END IF;

  IF entry_expires_at <= now() THEN
    RAISE EXCEPTION 'Expired diary entries cannot receive flower responses'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

REVOKE ALL ON FUNCTION public.validate_diary_flower_response() FROM PUBLIC;--> statement-breakpoint

CREATE TRIGGER validate_diary_flower_response_before_write
BEFORE INSERT OR UPDATE ON public.diary_flower_responses
FOR EACH ROW
EXECUTE FUNCTION public.validate_diary_flower_response();--> statement-breakpoint

ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.diary_flower_responses ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "members can read visible diary entries"
ON public.diary_entries
FOR SELECT
TO authenticated
USING (
  public.is_member()
  AND (author_id = (SELECT auth.uid()) OR expires_at > now())
);--> statement-breakpoint

CREATE POLICY "members can create their own diary entries"
ON public.diary_entries
FOR INSERT
TO authenticated
WITH CHECK (public.is_member() AND author_id = (SELECT auth.uid()));--> statement-breakpoint

CREATE POLICY "authors can update active diary entries"
ON public.diary_entries
FOR UPDATE
TO authenticated
USING (
  public.is_member()
  AND author_id = (SELECT auth.uid())
  AND expires_at > now()
)
WITH CHECK (
  public.is_member()
  AND author_id = (SELECT auth.uid())
  AND expires_at > now()
);--> statement-breakpoint

CREATE POLICY "authors can delete active diary entries"
ON public.diary_entries
FOR DELETE
TO authenticated
USING (
  public.is_member()
  AND author_id = (SELECT auth.uid())
  AND expires_at > now()
);--> statement-breakpoint

CREATE POLICY "members can read visible diary flowers"
ON public.diary_flower_responses
FOR SELECT
TO authenticated
USING (
  public.is_member()
  AND EXISTS (
    SELECT 1
    FROM public.diary_entries AS entry
    WHERE entry.id = entry_id
      AND (
        entry.author_id = (SELECT auth.uid())
        OR (responder_id = (SELECT auth.uid()) AND entry.expires_at > now())
      )
  )
);--> statement-breakpoint

CREATE POLICY "partners can create active diary flowers"
ON public.diary_flower_responses
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_member()
  AND responder_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.diary_entries AS entry
    WHERE entry.id = entry_id
      AND entry.author_id <> (SELECT auth.uid())
      AND entry.expires_at > now()
  )
);--> statement-breakpoint

CREATE POLICY "partners can update active diary flowers"
ON public.diary_flower_responses
FOR UPDATE
TO authenticated
USING (
  public.is_member()
  AND responder_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.diary_entries AS entry
    WHERE entry.id = entry_id
      AND entry.author_id <> (SELECT auth.uid())
      AND entry.expires_at > now()
  )
)
WITH CHECK (
  public.is_member()
  AND responder_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.diary_entries AS entry
    WHERE entry.id = entry_id
      AND entry.author_id <> (SELECT auth.uid())
      AND entry.expires_at > now()
  )
);--> statement-breakpoint

REVOKE ALL ON public.diary_entries, public.diary_flower_responses FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, DELETE ON public.diary_entries TO authenticated;--> statement-breakpoint
GRANT INSERT (author_id, content) ON public.diary_entries TO authenticated;--> statement-breakpoint
GRANT UPDATE (content, updated_at) ON public.diary_entries TO authenticated;--> statement-breakpoint
GRANT SELECT ON public.diary_flower_responses TO authenticated;--> statement-breakpoint
GRANT INSERT (entry_id, responder_id, flower_id) ON public.diary_flower_responses TO authenticated;--> statement-breakpoint
GRANT UPDATE (flower_id, updated_at) ON public.diary_flower_responses TO authenticated;
