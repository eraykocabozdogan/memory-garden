import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { mediaAssets, memoryItems } from "@/db/schema";
import { jsonError, readJsonObject } from "@/lib/http/json";
import { mediaOutputKeys } from "@/lib/media-processing/object-keys";
import { readProcessingBearer } from "@/lib/media-processing/token";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";

export const runtime = "nodejs";

function positiveInteger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function nonnegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function errorCode(value: unknown) {
  return typeof value === "string" && /^[a-z0-9_]{1,64}$/.test(value)
    ? value
    : "processing_failed";
}

async function deleteSourceObject(sourceObjectKey: string) {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2Config().bucketName,
      Key: sourceObjectKey,
    }),
  );
}

export async function POST(request: Request) {
  const token = readProcessingBearer(request);
  if (!token) return jsonError("Unauthorized.", 401);
  const body = await readJsonObject(request);
  if (!body) return jsonError("Invalid request.", 400);

  const [asset] = await getDatabase()
    .select({
      status: mediaAssets.status,
      kind: memoryItems.kind,
      sourceObjectKey: mediaAssets.sourceObjectKey,
    })
    .from(mediaAssets)
    .innerJoin(memoryItems, eq(mediaAssets.memoryItemId, memoryItems.id))
    .where(
      and(
        eq(mediaAssets.memoryItemId, token.itemId),
        eq(mediaAssets.processingRunId, token.runId),
      ),
    )
    .limit(1);

  if (!asset || asset.kind === "text") return jsonError("Processing run not found.", 404);

  if (asset.status === "ready") {
    await deleteSourceObject(asset.sourceObjectKey);
    return Response.json({ ok: true });
  }
  if (asset.status !== "processing") return jsonError("Processing run is not active.", 409);

  if (body.status === "failed") {
    await getDatabase()
      .update(mediaAssets)
      .set({
        status: "failed",
        errorCode: errorCode(body.errorCode),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mediaAssets.memoryItemId, token.itemId),
          eq(mediaAssets.processingRunId, token.runId),
          eq(mediaAssets.status, "processing"),
        ),
      );
    return Response.json({ ok: true });
  }

  if (body.status !== "succeeded") return jsonError("Invalid processing status.", 400);

  const width = positiveInteger(body.width);
  const height = positiveInteger(body.height);
  const durationSeconds =
    asset.kind === "video" ? nonnegativeInteger(body.durationSeconds) : null;
  if (!width || !height || (asset.kind === "video" && durationSeconds === null)) {
    return jsonError("Invalid output metadata.", 400);
  }

  const keys = mediaOutputKeys(token.itemId, token.runId, asset.kind);
  const expectedDisplayMimeType = asset.kind === "photo" ? "image/webp" : "video/mp4";
  const bucket = getR2Config().bucketName;
  let displaySizeBytes: number;

  try {
    const [display, preview] = await Promise.all([
      getR2Client().send(
        new HeadObjectCommand({ Bucket: bucket, Key: keys.displayObjectKey }),
      ),
      getR2Client().send(
        new HeadObjectCommand({ Bucket: bucket, Key: keys.previewObjectKey }),
      ),
    ]);
    if (
      !display.ContentLength ||
      display.ContentType?.toLowerCase() !== expectedDisplayMimeType ||
      !preview.ContentLength ||
      preview.ContentType?.toLowerCase() !== "image/webp"
    ) {
      return jsonError("Output objects could not be verified.", 409);
    }
    displaySizeBytes = display.ContentLength;
  } catch {
    return jsonError("Output objects could not be found.", 409);
  }

  await getDatabase()
    .update(mediaAssets)
    .set({
      status: "ready",
      displayObjectKey: keys.displayObjectKey,
      previewObjectKey: keys.previewObjectKey,
      displayMimeType: expectedDisplayMimeType,
      displaySizeBytes,
      width,
      height,
      durationSeconds,
      errorCode: null,
      processedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(mediaAssets.memoryItemId, token.itemId),
        eq(mediaAssets.processingRunId, token.runId),
        eq(mediaAssets.status, "processing"),
      ),
    );

  await deleteSourceObject(asset.sourceObjectKey);
  return Response.json({ ok: true });
}
