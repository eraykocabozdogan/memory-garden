import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getCurrentMemberId } from "@/features/auth/member";
import { jsonError } from "@/lib/http/json";
import { dispatchMediaProcessing } from "@/lib/media-processing/dispatch";

export const runtime = "nodejs";

export async function POST(
  _: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  if (!(await getCurrentMemberId())) return jsonError("Oturum gerekli.", 401);
  const { itemId } = await context.params;
  const runId = randomUUID();

  const [asset] = await getDatabase()
    .update(mediaAssets)
    .set({
      status: "queued",
      processingRunId: runId,
      errorCode: null,
      updatedAt: new Date(),
    })
    .where(and(eq(mediaAssets.memoryItemId, itemId), eq(mediaAssets.status, "failed")))
    .returning({ memoryItemId: mediaAssets.memoryItemId });

  if (!asset) return jsonError("Yeniden işlenebilecek medya bulunamadı.", 409);

  try {
    await dispatchMediaProcessing(itemId, runId);
  } catch {
    return jsonError("İşleme görevi başlatılamadı. Daha sonra yeniden dene.", 503);
  }

  return Response.json({ ok: true });
}
