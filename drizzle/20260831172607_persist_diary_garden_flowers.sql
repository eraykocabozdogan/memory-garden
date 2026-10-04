DROP POLICY IF EXISTS "members can read visible diary flowers"
ON public.diary_flower_responses;--> statement-breakpoint

CREATE POLICY "members can read permanent diary flowers"
ON public.diary_flower_responses
FOR SELECT
TO authenticated
USING (
  public.is_member()
  AND (
    responder_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.diary_entries AS entry
      WHERE entry.id = entry_id
        AND entry.author_id = (SELECT auth.uid())
    )
  )
);
