import {
  CreateMultipartUploadCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { getCurrentMemberId } from "@/features/auth/member";
import { jsonError, readJsonObject } from "@/lib/http/json";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";
import {
  createUploadToken,
  MAX_UPLOAD_BYTES,
  MULTIPART_PART_SIZE_BYTES,
  SINGLE_UPLOAD_LIMIT_BYTES,
  type MediaKind,
  type UploadTokenPayload,
} from "@/lib/r2/upload-token";

export const runtime = "nodejs";

function optionalPositiveInteger(value: unknown) {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined;
}

function safeExtension(fileName: string) {
  const extension = extname(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : "";
}

export async function POST(request: Request) {
  const userId = await getCurrentMemberId();
  if (!userId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  if (!body) return jsonError("Geçersiz istek.", 400);

  const kind: MediaKind | null =
    body.kind === "photo" || body.kind === "video" ? body.kind : null;
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim().toLowerCase() : "";
  const fileSizeBytes = Number(body.fileSizeBytes);

  if (!kind || !fileName || fileName.length > 255) {
    return jsonError("Dosya bilgileri geçersiz.", 400);
  }
  if (
    (kind === "photo" && !mimeType.startsWith("image/")) ||
    (kind === "video" && !mimeType.startsWith("video/"))
  ) {
    return jsonError("Dosya türü seçilen öğeyle eşleşmiyor.", 400);
  }
  if (!Number.isInteger(fileSizeBytes) || fileSizeBytes <= 0 || fileSizeBytes > MAX_UPLOAD_BYTES) {
    return jsonError("Dosya boyutu desteklenen sınırın dışında.", 400);
  }

  const now = new Date();
  const objectKey = [
    "incoming",
    userId,
    String(now.getUTCFullYear()),
    `${randomUUID()}${safeExtension(fileName)}`,
  ].join("/");
  const basePayload = {
    version: 1 as const,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    userId,
    objectKey,
    kind,
    originalFileName: fileName,
    mimeType,
    fileSizeBytes,
    width: optionalPositiveInteger(body.width),
    height: optionalPositiveInteger(body.height),
    durationSeconds: optionalPositiveInteger(body.durationSeconds),
  };
  const r2 = getR2Client();
  const { bucketName } = getR2Config();

  if (fileSizeBytes <= SINGLE_UPLOAD_LIMIT_BYTES) {
    const payload: UploadTokenPayload = { ...basePayload, mode: "single" };
    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: mimeType,
      }),
      { expiresIn: 15 * 60 },
    );

    return Response.json({
      mode: "single",
      uploadUrl,
      uploadToken: createUploadToken(payload),
    });
  }

  const multipart = await r2.send(
    new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: mimeType,
    }),
  );
  if (!multipart.UploadId) return jsonError("Parçalı yükleme başlatılamadı.", 502);

  const payload: UploadTokenPayload = {
    ...basePayload,
    mode: "multipart",
    uploadId: multipart.UploadId,
  };

  return Response.json({
    mode: "multipart",
    partSizeBytes: MULTIPART_PART_SIZE_BYTES,
    uploadToken: createUploadToken(payload),
  });
}
