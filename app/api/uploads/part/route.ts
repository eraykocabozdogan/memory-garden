import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getCurrentMemberId } from "@/features/auth/member";
import { jsonError, readJsonObject } from "@/lib/http/json";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";
import { MULTIPART_PART_SIZE_BYTES, verifyUploadToken } from "@/lib/r2/upload-token";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getCurrentMemberId();
  if (!userId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  const token = typeof body?.uploadToken === "string" ? verifyUploadToken(body.uploadToken) : null;
  const partNumber = Number(body?.partNumber);

  if (!token || token.userId !== userId || token.mode !== "multipart" || !token.uploadId) {
    return jsonError("Yükleme yetkisi geçersiz.", 403);
  }

  const partCount = Math.ceil(token.fileSizeBytes / MULTIPART_PART_SIZE_BYTES);
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > partCount) {
    return jsonError("Parça numarası geçersiz.", 400);
  }

  const uploadUrl = await getSignedUrl(
    getR2Client(),
    new UploadPartCommand({
      Bucket: getR2Config().bucketName,
      Key: token.objectKey,
      UploadId: token.uploadId,
      PartNumber: partNumber,
    }),
    { expiresIn: 15 * 60 },
  );

  return Response.json({ uploadUrl });
}
