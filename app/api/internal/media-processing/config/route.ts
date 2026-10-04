import {
  CreateMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { mediaAssets, memoryItems } from "@/db/schema";
import { jsonError } from "@/lib/http/json";
import { mediaOutputKeys } from "@/lib/media-processing/object-keys";
import { readProcessingBearer } from "@/lib/media-processing/token";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";

export const runtime = "nodejs";

const SIGNED_URL_LIFETIME_SECONDS = 48 * 60 * 60;

export async function POST(request: Request) {
  const token = readProcessingBearer(request);
  if (!token) return jsonError("Unauthorized.", 401);

  const [asset] = await getDatabase()
    .select({
      kind: memoryItems.kind,
      sourceObjectKey: mediaAssets.sourceObjectKey,
      sourceMimeType: mediaAssets.sourceMimeType,
      originalFileName: mediaAssets.originalFileName,
    })
    .from(mediaAssets)
    .innerJoin(memoryItems, eq(mediaAssets.memoryItemId, memoryItems.id))
    .where(
      and(
        eq(mediaAssets.memoryItemId, token.itemId),
        eq(mediaAssets.processingRunId, token.runId),
        eq(mediaAssets.status, "processing"),
      ),
    )
    .limit(1);

  if (!asset || asset.kind === "text") return jsonError("Processing run not found.", 404);

  const r2 = getR2Client();
  const bucket = getR2Config().bucketName;
  const keys = mediaOutputKeys(token.itemId, token.runId, asset.kind);
  const displayMimeType = asset.kind === "photo" ? "image/webp" : "video/mp4";

  const [sourceUrl, displayUpload, previewUploadUrl, displayVerificationUrl] = await Promise.all([
    getSignedUrl(r2, new GetObjectCommand({ Bucket: bucket, Key: asset.sourceObjectKey }), {
      expiresIn: SIGNED_URL_LIFETIME_SECONDS,
    }),
    r2.send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: keys.displayObjectKey,
        ContentType: displayMimeType,
      }),
    ),
    getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: bucket,
        Key: keys.previewObjectKey,
        ContentType: "image/webp",
      }),
      { expiresIn: SIGNED_URL_LIFETIME_SECONDS },
    ),
    getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: bucket, Key: keys.displayObjectKey }),
      { expiresIn: SIGNED_URL_LIFETIME_SECONDS },
    ),
  ]);
  if (!displayUpload.UploadId) return jsonError("Output upload could not be started.", 502);

  return Response.json({
    kind: asset.kind,
    originalFileName: asset.originalFileName,
    sourceMimeType: asset.sourceMimeType,
    sourceUrl,
    displayUpload: {
      uploadId: displayUpload.UploadId,
      verificationUrl: displayVerificationUrl,
      contentType: displayMimeType,
    },
    previewUpload: { url: previewUploadUrl, contentType: "image/webp" },
  });
}
