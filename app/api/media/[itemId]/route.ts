import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getCurrentMemberId } from "@/features/auth/member";
import { jsonError } from "@/lib/http/json";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext<"/api/media/[itemId]">) {
  if (!(await getCurrentMemberId())) return jsonError("Oturum gerekli.", 401);

  const { itemId } = await context.params;
  const variant = new URL(request.url).searchParams.get("variant") ?? "preview";
  if (variant !== "preview" && variant !== "display") {
    return jsonError("Medya türü geçersiz.", 400);
  }

  const [asset] = await getDatabase()
    .select({
      status: mediaAssets.status,
      displayObjectKey: mediaAssets.displayObjectKey,
      previewObjectKey: mediaAssets.previewObjectKey,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.memoryItemId, itemId))
    .limit(1);

  const objectKey = variant === "display" ? asset?.displayObjectKey : asset?.previewObjectKey;
  if (asset?.status !== "ready" || !objectKey) return jsonError("Medya hazır değil.", 404);

  const signedUrl = await getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: getR2Config().bucketName,
      Key: objectKey,
    }),
    { expiresIn: 5 * 60 },
  );

  return new Response(null, {
    status: 307,
    headers: {
      location: signedUrl,
      "cache-control": "private, max-age=240",
    },
  });
}
