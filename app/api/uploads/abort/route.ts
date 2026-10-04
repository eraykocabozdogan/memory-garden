import { AbortMultipartUploadCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getCurrentMemberId } from "@/features/auth/member";
import { jsonError, readJsonObject } from "@/lib/http/json";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";
import { verifyUploadToken } from "@/lib/r2/upload-token";

export const runtime = "nodejs";

function isMissingMultipartUpload(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? error.name : undefined;
  const metadata = "$metadata" in error ? error.$metadata : undefined;
  const status =
    metadata && typeof metadata === "object" && "httpStatusCode" in metadata
      ? metadata.httpStatusCode
      : undefined;
  return name === "NoSuchUpload" || status === 404;
}

export async function POST(request: Request) {
  const userId = await getCurrentMemberId();
  if (!userId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  const token = typeof body?.uploadToken === "string" ? verifyUploadToken(body.uploadToken) : null;

  if (!token || token.userId !== userId) {
    return jsonError("Yükleme yetkisi geçersiz.", 403);
  }

  const [committed] = await getDatabase()
    .select({ memoryItemId: mediaAssets.memoryItemId })
    .from(mediaAssets)
    .where(eq(mediaAssets.sourceObjectKey, token.objectKey))
    .limit(1);
  if (committed) return jsonError("Anıya bağlanmış bir yükleme kaldırılamaz.", 409);

  const r2 = getR2Client();
  const bucket = getR2Config().bucketName;
  if (token.mode === "multipart" && token.uploadId) {
    try {
      await r2.send(
        new AbortMultipartUploadCommand({
          Bucket: bucket,
          Key: token.objectKey,
          UploadId: token.uploadId,
        }),
      );
    } catch (error) {
      if (!isMissingMultipartUpload(error)) throw error;
    }
  }

  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: token.objectKey }));

  return Response.json({ discarded: true });
}
