import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { mediaAssets, memoryItems } from "@/db/schema";
import { jsonError, readJsonObject } from "@/lib/http/json";
import { mediaOutputKeys } from "@/lib/media-processing/object-keys";
import { readProcessingBearer } from "@/lib/media-processing/token";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";

export const runtime = "nodejs";

const SIGNED_PART_LIFETIME_SECONDS = 15 * 60;
const MAX_PART_COUNT = 10_000;

type CompletedPart = { ETag: string; PartNumber: number };

function uploadId(value: unknown) {
  return typeof value === "string" && value.length > 0 && value.length <= 1024 ? value : null;
}

function partNumber(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= MAX_PART_COUNT ? number : null;
}

function completedParts(value: unknown): CompletedPart[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_PART_COUNT) return null;

  const parts = value.map((part, index) => {
    if (!part || typeof part !== "object") return null;
    const record = part as Record<string, unknown>;
    const ETag = typeof record.eTag === "string" ? record.eTag : "";
    const PartNumber = partNumber(record.partNumber);
    if (!ETag || ETag.length > 256 || PartNumber !== index + 1) return null;
    return { ETag, PartNumber };
  });

  return parts.every((part): part is CompletedPart => Boolean(part)) ? parts : null;
}

export async function POST(request: Request) {
  const token = readProcessingBearer(request);
  if (!token) return jsonError("Unauthorized.", 401);

  const body = await readJsonObject(request);
  const multipartUploadId = uploadId(body?.uploadId);
  if (!body || !multipartUploadId) return jsonError("Invalid multipart request.", 400);

  const [asset] = await getDatabase()
    .select({ kind: memoryItems.kind })
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
  const key = mediaOutputKeys(token.itemId, token.runId, asset.kind).displayObjectKey;

  if (body.action === "part") {
    const number = partNumber(body.partNumber);
    if (!number) return jsonError("Invalid part number.", 400);

    const uploadUrl = await getSignedUrl(
      r2,
      new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: multipartUploadId,
        PartNumber: number,
      }),
      { expiresIn: SIGNED_PART_LIFETIME_SECONDS },
    );
    return Response.json({ uploadUrl });
  }

  if (body.action === "complete") {
    const parts = completedParts(body.parts);
    if (!parts) return jsonError("Multipart upload is incomplete or unordered.", 400);

    await r2.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: multipartUploadId,
        MultipartUpload: { Parts: parts },
      }),
    );
    return Response.json({ completed: true });
  }

  if (body.action === "abort") {
    await r2.send(
      new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: multipartUploadId,
      }),
    );
    return Response.json({ aborted: true });
  }

  return jsonError("Invalid multipart action.", 400);
}
