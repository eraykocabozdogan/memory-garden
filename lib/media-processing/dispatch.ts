import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/db";
import { mediaAssets } from "@/db/schema";

import { startMediaProcessingJob } from "./cloud-run";

export async function dispatchMediaProcessing(itemId: string, runId: string) {
  const [claimed] = await getDatabase()
    .update(mediaAssets)
    .set({
      status: "processing",
      attemptCount: sql`${mediaAssets.attemptCount} + 1`,
      errorCode: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(mediaAssets.memoryItemId, itemId),
        eq(mediaAssets.processingRunId, runId),
        eq(mediaAssets.status, "queued"),
      ),
    )
    .returning({ memoryItemId: mediaAssets.memoryItemId });

  if (!claimed) throw new Error("Media processing run is no longer queued.");

  try {
    await startMediaProcessingJob(itemId, runId);
  } catch (error) {
    await getDatabase()
      .update(mediaAssets)
      .set({ status: "failed", errorCode: "dispatch_failed", updatedAt: new Date() })
      .where(
        and(
          eq(mediaAssets.memoryItemId, itemId),
          eq(mediaAssets.processingRunId, runId),
          eq(mediaAssets.status, "processing"),
        ),
      );
    throw error;
  }
}
