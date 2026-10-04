import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";

import { getCurrentMemberId } from "@/features/auth/member";
import { jsonError, readJsonObject } from "@/lib/http/json";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";
import { MULTIPART_PART_SIZE_BYTES, verifyUploadToken } from "@/lib/r2/upload-token";

export const runtime = "nodejs";

type CompletedPart = { ETag: string; PartNumber: number };

function completedParts(value: unknown): CompletedPart[] | null {
  if (!Array.isArray(value)) return null;
  const parts = value.map((part) => {
    if (!part || typeof part !== "object") return null;
    const record = part as Record<string, unknown>;
    const ETag = typeof record.eTag === "string" ? record.eTag : "";
    const PartNumber = Number(record.partNumber);
    return ETag && Number.isInteger(PartNumber) ? { ETag, PartNumber } : null;
  });
  return parts.every((part): part is CompletedPart => Boolean(part)) ? parts : null;
}

export async function POST(request: Request) {
  const userId = await getCurrentMemberId();
  if (!userId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  const token = typeof body?.uploadToken === "string" ? verifyUploadToken(body.uploadToken) : null;
  const parts = completedParts(body?.parts);

  if (!token || token.userId !== userId || token.mode !== "multipart" || !token.uploadId) {
    return jsonError("Yükleme yetkisi geçersiz.", 403);
  }

  const expectedPartCount = Math.ceil(token.fileSizeBytes / MULTIPART_PART_SIZE_BYTES);
  if (
    !parts ||
    parts.length !== expectedPartCount ||
    parts.some((part, index) => part.PartNumber !== index + 1)
  ) {
    return jsonError("Yüklenen parçalar eksik veya sırasız.", 400);
  }

  await getR2Client().send(
    new CompleteMultipartUploadCommand({
      Bucket: getR2Config().bucketName,
      Key: token.objectKey,
      UploadId: token.uploadId,
      MultipartUpload: { Parts: parts },
    }),
  );

  return Response.json({ completed: true });
}
